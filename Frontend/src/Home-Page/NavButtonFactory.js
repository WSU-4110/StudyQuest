
import NavButton from './NavButton';

function NavButtonFactory({ type, navigate }) {
    const buttonConfig = { 
        signUp: { text: "Create Account", onClick: () => navigate("/login") },
        createSet: { text: "Begin a Study Set", onClick: () => navigate("/create") },

        createSet: { text: "Begin a Study Set", onClick: () => navigate("/create") },

    };
    const config = buttonConfig[type];
    if (!config) {
        console.error(`Invalid button type: ${type}`);
        return null;
    }
    return (
        <NavButton text={config.text} onClick={config.onClick} />
    );

}
export default NavButtonFactory;