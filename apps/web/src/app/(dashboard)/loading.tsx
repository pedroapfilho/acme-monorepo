import { BoneyardSkeleton } from "@/components/boneyard-skeleton";

const Loading = () => {
  return (
    <BoneyardSkeleton
      fixture={
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 h-9 w-48 rounded bg-neutral-200" />
            <div className="mb-4 rounded-lg bg-white p-6 shadow">
              <div className="mb-2 h-7 w-40 rounded bg-neutral-200" />
              <div className="mb-2 h-5 w-64 rounded bg-neutral-200" />
              <div className="mb-2 h-5 w-48 rounded bg-neutral-200" />
              <div className="h-5 w-56 rounded bg-neutral-200" />
            </div>
            <div className="h-10 w-24 rounded bg-neutral-200" />
          </div>
        </div>
      }
      name="dashboard"
    />
  );
};

export default Loading;
