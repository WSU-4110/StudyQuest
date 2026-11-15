
function NavButton({ text, onClick }) {
  return (
    <button className="nav-button" onClick={onClick}>
      {text}
    </button>
  );
}
export default NavButton;