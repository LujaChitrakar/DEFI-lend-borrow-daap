const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 place-items-center">
          {/* Help & Support */}
          <div className="text-center col-start-2">
            <h3 className="text-xl font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Developers</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Developer Portal
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
