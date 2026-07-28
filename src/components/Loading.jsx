import logo from "../assets/agrinet.svg";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 animate-in fade-in duration-300">
      <img src={logo} alt="AgriNet" className="h-20 w-20 animate-pulse" />

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-600 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-green-600 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-green-600 animate-bounce" />
      </div>
    </div>
  );
}
