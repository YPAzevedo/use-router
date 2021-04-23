import useRouter, { Link } from "./useRouter";
import "./styles.css";

function Home() {
  return <h1>Welcome, this is the home page.</h1>;
}

function Login() {
  return <h1>Welcome, this is the login page.</h1>;
}

function User({ location: { id } }: { location: { id: string } }) {
  return <h1>Welcome, this is the user {id} page.</h1>;
}

function Users() {
  return <h1>Welcome, this is the users page.</h1>;
}

function Error() {
  return <h1>404, not found.</h1>;
}

export default function App() {
  const [component] = useRouter(
    {
      "/home": Home,
      "/login": Login,
      "/user/:id": User,
      "/user": Users,
      "/404": Error
    },
    { fallback: Error }
  );

  return (
    <div className="App">
      <h1>use-routes</h1>
      <h2>Simple router hook!</h2>
      <nav
        style={{ display: "flex", justifyContent: "center", columnGap: "16px" }}
      >
        <Link to="/home">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/user/1">User 1</Link>
        <Link to="/user">Users</Link>
        <Link to="/404">404</Link>
      </nav>
      {component}
    </div>
  );
}
