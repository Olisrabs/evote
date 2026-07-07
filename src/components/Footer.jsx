const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Accessibility Statement', href: '#' },
  { label: 'Security Protocol', href: '#' },
];

const Footer = () => {
  return (
    <footer className="w-full py-xl mt-auto bg-surface-dim">
      <div className="max-w-container-max mx-auto px-4 md:px-md flex flex-col md:flex-row justify-between items-center space-y-md md:space-y-0">
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start space-y-xs">
          <span className="text-headline-md font-bold text-primary mb-xs">e-vote</span>
          <p className="text-body-md text-on-surface-variant text-center md:text-left max-w-sm">
            © 2024 e-vote. Secure Digital University Infrastructure.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-md">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Icon buttons */}
        <div className="flex space-x-base">
          <button className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">language</span>
          </button>
          <button className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">shield</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
