import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] p-6 text-[#13263a]">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-semibold">That page is not in this care plan.</h1>
        <Link className="button-primary mt-7 inline-flex" href="/">
          Return to ClearCare
        </Link>
      </div>
    </main>
  );
}
