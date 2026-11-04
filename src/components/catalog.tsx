"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { products } from "@/lib/commerce";
import { ProductCard } from "./store";
export function Catalog() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [occasion, setOccasion] = useState(params.get("occasion") || "All");
  const [branch, setBranch] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [budget, setBudget] = useState("All");
  const [type, setType] = useState("All");
  const list = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (occasion === "All" ||
          p.occasion === occasion ||
          p.occasionTags?.includes(occasion)) &&
        (branch === "All" || p.branch === branch) &&
        (type === "All" || p.type === type) &&
        (budget === "All" || (!p.custom && p.price <= Number(budget))),
    )
    .sort((a, b) =>
      sort === "Price: low to high"
        ? a.price - b.price
        : sort === "Price: high to low"
          ? b.price - a.price
          : 0,
    );
  return (
    <section className="section">
      <p className="eyebrow">SAMPLE ARRANGEMENTS · REAL INSPIRATION</p>
      <h1>The flower collection</h1>
      <p className="intro">
        Find something that feels like them. Every item below is a demo, with
        sample pricing and illustrative demo imagery.
      </p>
      <div className="filters">
        <label>
          Search
          <input
            type="search"
            placeholder="Find your flowers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Occasion
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
          >
            {[
              "All",
              "Birthday",
              "Anniversary",
              "Love & Romance",
              "Get Well Soon",
              "Congratulations",
              "Sympathy",
              "Custom",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Branch
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option>All</option>
            <option value="valenzuela">Valenzuela</option>
            <option value="angeles">Angeles</option>
          </select>
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>All</option>
            <option value="bouquet">Bouquets</option>
            <option value="standee">Standees</option>
          </select>
        </label>
        <label>
          Sample budget
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option>All</option>
            <option value="150000">Up to ₱1,500</option>
            <option value="200000">Up to ₱2,000</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {["Featured", "Price: low to high", "Price: high to low"].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <p className="result-count" role="status">
        {list.length} demo arrangements
      </p>
      {list.length ? (
        <div className="product-grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No blooms found just yet.</h2>
          <p>Try another search or clear the filters.</p>
          <button
            className="button"
            onClick={() => {
              setSearch("");
              setOccasion("All");
              setBranch("All");
              setBudget("All");
              setType("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <p className="notice">
        Looking for something different?{" "}
        <Link href="/contact?request=custom">
          Ask about a custom arrangement.
        </Link>
      </p>
    </section>
  );
}
