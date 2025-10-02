import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const getTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        // Simulate fetching a topic from a database
        const topic = { id, title: 'Sample Topic', description: 'This is a sample topic description.' };
        if (!topic) {
            throw new AppError(`Topic with id ${id} not found`, 404, 'TOPIC_NOT_FOUND');
        }
        return res.status(200).json({ status: 'success', data: topic });
    }
    catch (error) {
        next(error);
    }
};

export const updateTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        // Simulate updating a topic in a database
        const updatedTopic = { id, title, description };
        return res.status(200).json({ status: 'success', data: updatedTopic });
    }
    catch (error) {
        next(error);
    }
};

export const deleteTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        // Simulate deleting a topic from a database
        return res.status(204).json({ status: 'success', message: 'Topic deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
