import app from "./app";
import { renderComponent } from "../src";
import './style.css';

// Render the app to the root element
renderComponent(app, document.getElementById('root') as HTMLElement);