const YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-(--breakpoint-xl) px-6 py-10 text-sm text-muted-foreground md:px-8">
        <p>&copy; {YEAR} Acme. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
