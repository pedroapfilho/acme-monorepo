import { BoneyardSkeleton } from "@/components/boneyard-skeleton";

const Loading = () => {
  return (
    <BoneyardSkeleton
      fixture={
        <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 h-7 w-40 rounded bg-neutral-200" />
            <div className="mb-6 h-5 w-56 rounded bg-neutral-200" />
            <div className="flex flex-col gap-4">
              <div className="h-10 w-full rounded bg-neutral-200" />
              <div className="h-10 w-full rounded bg-neutral-200" />
              <div className="h-10 w-full rounded bg-neutral-200" />
            </div>
          </div>
          <div className="h-5 w-48 self-center rounded bg-neutral-200" />
        </div>
      }
      name="auth"
    />
  );
};

export default Loading;
