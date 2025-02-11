import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          AI Learning Assistant
        </Link>
        <nav className="space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-primary">
            Login
          </Link>
          <Link href="/register" className="text-gray-700 hover:text-primary">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}