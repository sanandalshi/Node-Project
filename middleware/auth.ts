import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: string;
}

const secret = 'Pokemonsan@07';

const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies._id;
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decodedToken = jwt.verify(token, secret) as { user: { id: string } };
        req.userId = decodedToken.user.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export default isAuth;