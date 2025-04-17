import { createServer } from 'http';
import app from '../server';

const server = createServer(app);
export default server;
