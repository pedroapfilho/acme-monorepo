import Link from "next/link";

const Header = () => {
  return (
    <header className="flex flex-col border-b" style={{ viewTransitionName: "site-header" }}>
      <Link href="/about">About</Link>
    </header>
  );
};

export default Header;
