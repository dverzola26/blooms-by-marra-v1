import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const root = new URL("../", import.meta.url);
const ids = {
  owner: "40000000-0000-4000-8000-000000000001",
  staff: "40000000-0000-4000-8000-000000000002",
  other: "40000000-0000-4000-8000-000000000003",
  customer: "40000000-0000-4000-8000-000000000004",
  branch: "10000000-0000-4000-8000-000000000001",
  angeles: "10000000-0000-4000-8000-000000000002",
};
test("PostgreSQL migrations, role policies and staging order lifecycle", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,unique(bucket_id,name));alter table storage.objects enable row level security;grant usage on schema public,auth,storage to anon,authenticated;`,
    );
    for (const file of [
      "202611040001_foundation.sql",
      "202611040002_staging_workflows.sql",
    ])
      await db.exec(
        readFileSync(new URL("supabase/migrations/" + file, root), "utf8"),
      );
    await db.exec(`set app.allow_staging_seed='yes'`);
    await db.exec(
      readFileSync(new URL("supabase/seed-staging.sql", root), "utf8"),
    );
    await db.exec(
      `grant select,insert,update,delete on all tables in schema public,storage to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${ids.owner}'),('${ids.staff}'),('${ids.other}'),('${ids.customer}');insert into public.profiles values('${ids.owner}','owner',null),('${ids.staff}','staff','${ids.branch}'),('${ids.other}','staff','${ids.angeles}');`,
    );
    async function actor(id: string | null, role = "authenticated") {
      await db.exec(
        `reset role;set request.jwt.claim.sub='${id || ""}';set role ${role};`,
      );
    }
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const payload = {
      branchId: ids.branch,
      idempotencyKey: crypto.randomUUID(),
      fictionalDetails: true,
      lines: [
        {
          productId: "30000000-0000-4000-8000-000000000001",
          quantity: 2,
          message: "DEMO",
        },
      ],
      zoneId: "20000000-0000-4000-8000-000000000001",
      contact: {
        customer: "DEMO sender",
        recipient: "DEMO recipient",
        phone: "09123456789",
        recipientPhone: "09123456789",
        email: "demo@example.com",
        mode: "delivery",
        payment: "GCash",
        date: tomorrow,
        window: "Afternoon",
        address: "123 Fictional Street",
        consent: true,
      },
    };
    const create = async (p = payload) =>
      (
        await db.query<{ id: string }>(
          "select public.create_staging_order($1::jsonb) id",
          [JSON.stringify(p)],
        )
      ).rows[0].id;
    const change = async (
      id: string,
      version: number,
      action: string,
      amount: number | null = null,
      payment: string | null = null,
    ) =>
      db.query("select public.change_staging_order($1,$2,$3,$4,$5)", [
        id,
        version,
        action,
        amount,
        payment,
      ]);
    await actor(ids.owner);
    const order = await create();
    await t.test(
      "transactional totals from DB, no duplicate included fee, audit event",
      async () => {
        const r = (
          await db.query<{ total_centavos: number; fee_centavos: number }>(
            "select * from orders where id=$1",
            [order],
          )
        ).rows[0];
        assert.equal(Number(r.total_centavos), 240000);
        assert.equal(Number(r.fee_centavos), 0);
        assert.equal(
          (
            await db.query(
              "select * from order_status_events where order_id=$1",
              [order],
            )
          ).rows.length,
          1,
        );
      },
    );
    await t.test("idempotent retries preserve the original order", async () =>
      assert.equal(await create(), order),
    );
    await t.test("idempotency refuses changed request bodies", async () => {
      await assert.rejects(
        create({
          ...payload,
          contact: { ...payload.contact, customer: "Changed sender" },
        }),
        /Duplicate request mismatch/,
      );
    });
    await t.test("staging settings are owner-only and audited", async () => {
      await actor(ids.staff);
      await assert.rejects(
        db.query("select set_staging_operations($1,'15:00')", [ids.branch]),
        /Forbidden/,
      );
      await actor(ids.owner);
      await db.query("select set_staging_operations($1,'15:00')", [ids.branch]);
      assert.equal(
        (await db.query("select * from staff_actions")).rows.length,
        1,
      );
    });
    await t.test(
      "owner cannot bypass transitions using direct updates or alter audit history",
      async () => {
        assert.equal(
          (
            await db.query(
              "update orders set fulfillment_state='completed' where id=$1 returning id",
              [order],
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "delete from order_status_events where order_id=$1 returning id",
              [order],
            )
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "anonymous and ordinary users cannot read PII or create orders",
      async () => {
        await actor(null, "anon");
        assert.equal(
          (await db.query("select * from order_addresses")).rows.length,
          0,
        );
        await assert.rejects(create());
        await actor(ids.customer);
        assert.equal((await db.query("select * from orders")).rows.length, 0);
        await assert.rejects(create(), /Forbidden/);
      },
    );
    await t.test(
      "staff cannot read another branch or perform owner decisions",
      async () => {
        await actor(ids.other);
        assert.equal((await db.query("select * from orders")).rows.length, 0);
        await assert.rejects(change(order, 0, "approve"), /Forbidden/);
        await actor(ids.staff);
        assert.equal((await db.query("select * from orders")).rows.length, 1);
        await assert.rejects(change(order, 0, "approve"), /Forbidden/);
      },
    );
    await actor(ids.owner);
    await t.test(
      "unsupported destinations, cross-branch and bad quantities are rejected",
      async () => {
        await assert.rejects(
          create({
            ...payload,
            idempotencyKey: crypto.randomUUID(),
            zoneId: "20000000-0000-4000-8000-000000000002",
          }),
          /Unavailable destination/,
        );
        await assert.rejects(
          create({
            ...payload,
            idempotencyKey: crypto.randomUUID(),
            lines: [{ ...payload.lines[0], quantity: 0 }],
          }),
          /Invalid item/,
        );
      },
    );
    await t.test(
      "approval and payment are independent; stale actions rejected",
      async () => {
        await assert.rejects(change(order, 0, "confirm"), /Invalid transition/);
        await change(order, 0, "approve");
        await assert.rejects(change(order, 0, "confirm"), /Stale order/);
        await assert.rejects(change(order, 1, "confirm"), /Payment required/);
      },
    );
    await t.test(
      "proof requires a private object, stays submitted until owner verification",
      async () => {
        await assert.rejects(
          db.query("select register_staging_proof($1,$2,100,240000)", [
            order,
            order + "/missing.jpg",
          ]),
          /Not found/,
        );
        await db.query(
          "insert into storage.objects(bucket_id,name) values('payment-proofs',$1)",
          [order + "/test.jpg"],
        );
        const p = (
          await db.query<{ id: string }>(
            "select register_staging_proof($1,$2,100,240000) id",
            [order, order + "/test.jpg"],
          )
        ).rows[0].id;
        assert.equal(
          (
            await db.query<{ payment_state: string }>(
              "select payment_state from orders where id=$1",
              [order],
            )
          ).rows[0].payment_state,
          "submitted",
        );
        await change(order, 2, "verify_payment", null, p);
        assert.equal(
          (
            await db.query<{ payment_state: string }>(
              "select payment_state from orders where id=$1",
              [order],
            )
          ).rows[0].payment_state,
          "verified",
        );
      },
    );
    await t.test(
      "fulfillment advances only through the correct branch/mode sequence",
      async () => {
        await change(order, 3, "confirm");
        await actor(ids.staff);
        await change(order, 4, "preparing");
        await assert.rejects(
          change(order, 5, "ready_for_pickup"),
          /Invalid transition/,
        );
        await change(order, 5, "out_for_delivery");
        await change(order, 6, "completed");
      },
    );
    await t.test(
      "cash pickup completion requires an explicit owner-recorded test receipt",
      async () => {
        await actor(ids.owner);
        const id = await create({
          ...payload,
          idempotencyKey: crypto.randomUUID(),
          contact: { ...payload.contact, mode: "pickup", payment: "Cash" },
        });
        await change(id, 0, "approve");
        await change(id, 1, "confirm");
        await actor(ids.staff);
        await change(id, 2, "preparing");
        await change(id, 3, "ready_for_pickup");
        await assert.rejects(change(id, 4, "completed"), /Payment required/);
        await assert.rejects(change(id, 4, "record_cash"), /Forbidden/);
        await actor(ids.owner);
        await change(id, 4, "record_cash");
        await change(id, 5, "completed");
      },
    );
    await t.test(
      "proof object policies deny other branches and anonymous readers",
      async () => {
        await actor(ids.other);
        assert.equal(
          (await db.query("select * from storage.objects")).rows.length,
          0,
        );
        await assert.rejects(
          db.query(
            "insert into storage.objects(bucket_id,name) values('payment-proofs',$1)",
            [order + "/blocked.jpg"],
          ),
        );
        await actor(null, "anon");
        assert.equal(
          (await db.query("select * from payment_proof_files")).rows.length,
          0,
        );
      },
    );
    await t.test(
      "expiring tracking tokens expose status only and rotation revokes prior token",
      async () => {
        await actor(ids.owner);
        const token = "a".repeat(64);
        const hash = Buffer.from(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(token),
          ),
        ).toString("hex");
        await db.query("select rotate_staging_tracking($1,$2)", [order, hash]);
        await actor(null, "anon");
        const value = (
          await db.query<{ data: Record<string, unknown> }>(
            "select track_staging_order($1,$2) data",
            [order, token],
          )
        ).rows[0].data;
        assert.equal(value.fulfillment, "completed");
        assert.ok(!JSON.stringify(value).includes("sender"));
        assert.equal(
          (
            await db.query<{ data: null }>(
              "select track_staging_order($1,$2) data",
              [order, "b".repeat(64)],
            )
          ).rows[0].data,
          null,
        );
        await actor(ids.owner);
        const nextToken = "b".repeat(64);
        const nextHash = Buffer.from(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(nextToken),
          ),
        ).toString("hex");
        await db.query("select rotate_staging_tracking($1,$2)", [
          order,
          nextHash,
        ]);
        await actor(null, "anon");
        assert.equal(
          (
            await db.query<{ data: null }>(
              "select track_staging_order($1,$2) data",
              [order, token],
            )
          ).rows[0].data,
          null,
        );
        assert.ok(
          (
            await db.query<{ data: unknown }>(
              "select track_staging_order($1,$2) data",
              [order, nextToken],
            )
          ).rows[0].data,
        );
        await db.exec("reset role");
        await db.query(
          "update orders set tracking_expires_at=now()-interval '1 second' where id=$1",
          [order],
        );
        await actor(null, "anon");
        assert.equal(
          (
            await db.query<{ data: null }>(
              "select track_staging_order($1,$2) data",
              [order, nextToken],
            )
          ).rows[0].data,
          null,
        );
      },
    );
  } finally {
    await db.close();
  }
});
