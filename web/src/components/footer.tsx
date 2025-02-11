export default function Footer() {
    return (
      <footer className="bg-white shadow-sm mt-auto">
        <div className="container mx-auto px-6 py-4 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} AI Learning Assistant. Licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CC BY 4.0
            </a>
            .
          </p>
        </div>
      </footer>
    );
  }