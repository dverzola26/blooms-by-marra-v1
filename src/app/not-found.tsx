import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section empty">
      <p className="eyebrow">A LITTLE DETOUR</p>
      <h1>This bloom hasn’t opened here.</h1>
      <p>We couldn’t find that page or arrangement.</p>
      <Link className="button" href="/shop">
        Explore the collection
      </Link>
    </section>
  );
}
