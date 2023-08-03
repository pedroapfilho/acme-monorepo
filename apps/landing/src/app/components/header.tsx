import Link from "next/link";

const Header = () => {


  return (
    <header
      className="flex flex-col border-b"
    >
      <Link href="/about">
        About
      </Link>
    </header>
  );
};

export default Header;
