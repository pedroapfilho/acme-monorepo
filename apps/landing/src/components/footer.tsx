const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Acme. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
