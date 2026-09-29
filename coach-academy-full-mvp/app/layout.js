import "./globals.css";
export const metadata={title:"Coach Academy",description:"Online coaching and courses"};
export default function RootLayout({children}){return <><nav className="nav"><div className="navin"><a className="brand" href="/">Coach Academy</a><a className="btn secondary" href="/admin">Coach Admin</a></div></nav>{children}</>}