import app from "./app";
import { bootstrapOsiris } from "../src";
import './style.css';

// Render the app to the root element
bootstrapOsiris(app, document.getElementById('root') as HTMLElement);