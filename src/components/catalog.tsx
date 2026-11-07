"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { products } from "@/lib/commerce";
import { categories, matchesCategory } from "@/lib/categories";
import { ProductCard } from "./store";
import styles from "./storefront-redesign.module.css";
export function Catalog() {
  const params = useSearchParams();
  const router = useRouter();
  const category = categories.find((c) => c.id === params.get("category"));
  const selectedCategory = category?.id || "all";
  const categoryHasProducts = products.some((p) =>
    matchesCategory(p, selectedCategory),
  );
  function changeCategory(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("category");
    else next.set("category", value);
    router.replace(`/shop${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  const [search, setSearch] = useState("");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [occasion, setOccasion] = useState(params.get("occasion") || "All");
  const [branch, setBranch] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [budget, setBudget] = useState("All");
  const [type, setType] = useState("All");
  const list = products
    .filter(
      (p) =>
        matchesCategory(p, selectedCategory) &&
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
    <section className={`section ${styles.catalog}`}>
      <h1>The flower collection</h1>
      <p className="intro">
        Browse sample arrangements by category or occasion.
      </p>
      <p className={styles.demoNotice}>
        Demo only — arrangements and prices are illustrative. Orders and
        payments are disabled.
      </p>
      <div className={`filters ${styles.filters}`}>
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
          Category
          <select
            value={selectedCategory}
            onChange={(e) => changeCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            <optgroup label="Blooms">
              <option value="blooms">All Blooms</option>
              {categories
                .filter((c) => "parent" in c)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
            {categories
              .filter((c) => !("parent" in c) && c.id !== "blooms")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
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
        <button
          type="button"
          className={styles.moreToggle}
          aria-expanded={moreFiltersOpen}
          aria-controls="catalog-more-filters"
          onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
        >
          {moreFiltersOpen ? "Hide extra filters" : "More filters"}
        </button>
        <div
          id="catalog-more-filters"
          className={styles.secondaryFilters}
          data-open={moreFiltersOpen}
        >
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
      </div>
      <div className={styles.resultsBar}>
        <p className="result-count" role="status">
          {list.length} demo arrangements
        </p>
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            setSearch("");
            changeCategory("all");
            setOccasion("All");
            setBranch("All");
            setBudget("All");
            setType("All");
            setSort("Featured");
          }}
        >
          Clear filters
        </button>
      </div>
      {list.length ? (
        <div className="product-grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>
            {category && !categoryHasProducts
              ? `${category.name} catalog is being prepared.`
              : "No blooms found just yet."}
          </h2>
          <p>
            {category && !categoryHasProducts
              ? "Approved products, photos and prices will be added here once supplied by the shop. No items are available to purchase."
              : "Try another search or clear the filters."}
          </p>
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
