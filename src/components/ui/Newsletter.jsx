// src/components/ui/Newsletter.jsx
export default function Newsletter() {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center my-20 border border-slate-800">
      <h3 className="text-3xl md:text-5xl font-black text-white mb-4">Stay in the loop.</h3>
      <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">Get notified of new insights delivered straight to your inbox.</p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" placeholder="you@example.com" className="flex-1 bg-slate-800 border-none rounded-full px-6 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all">Join</button>
      </div>
    </div>
  );
}