import Link from 'next/link';
export default function Home() { return <main style={{ padding: 24 }}><h1>Conference System</h1><Link href='/kiosk'>Kiosk</Link> | <Link href='/admin'>Admin</Link></main>; }
