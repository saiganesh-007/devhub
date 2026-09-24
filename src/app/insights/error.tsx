"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card-surface card-surface--error text-center" role="alert">
      <strong className="text-card-title block">Insights unavailable</strong>
      <p className="text-body-secondary mx-auto mt-2 max-w-md">
        Your research summary could not be loaded. Your saved data is untouched.
      </p>
      <div className="mt-5 flex justify-center">
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Retry
        </button>
      </div>
    </div>
  );
}
