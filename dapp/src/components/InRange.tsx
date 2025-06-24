export default function InRange({ inRange }: { inRange: number }) {
  return (
    <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 gap-2 #013208">
      <div
        className={`flex justify-center items-center flex-grow-0 flex-shrink-0 gap-0.5 p-1 rounded-md ${inRange === 0 ? "bg-[#013208]" : "bg-[#330801]"}`}
      >
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0  px-0.5">
          <p
            className={`flex-grow-0 flex-shrink-0 text-xs text-left ${inRange === 0 ? "text-[#4fef5f]" : "text-[#ef5f4f]"}`}
          >
            {inRange === 0 ? "In" : "Out of"} range
          </p>
        </div>
      </div>
    </div>
  );
}
