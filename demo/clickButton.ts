import { button } from "../src"

const clickButton = (onClick: () => void, text: string) => {
    // Create a button element with an onClick handler and text
    return button({
        class: 'button',
        onClick: onClick
    }, text);
}

export default clickButton;