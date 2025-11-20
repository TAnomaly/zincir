import { prisma } from './lib/prisma.js';
import fs from 'fs-extra';
import path from 'path';

export function startCronJobs() {
    console.log('Starting cron jobs...');

    // Run every 1 hour
    setInterval(async () => {
        console.log('Running story cleanup job...');
        try {
            const now = new Date();
            const expiredStories = await prisma.story.findMany({
                where: {
                    expiresAt: {
                        lt: now
                    }
                }
            });

            if (expiredStories.length === 0) {
                console.log('No expired stories found.');
                return;
            }

            console.log(`Found ${expiredStories.length} expired stories.`);

            for (const story of expiredStories) {
                // mediaUrl format: http://domain.com/uploads/stories/YYYY-MM-DD/filename.ext
                try {
                    // Extract part after /uploads/
                    const urlParts = story.mediaUrl.split('/uploads/');
                    if (urlParts.length > 1) {
                        // Reconstruct local path
                        // process.cwd() in docker is /app
                        const relativePath = path.join('uploads', urlParts[1]);
                        const absolutePath = path.join(process.cwd(), relativePath);

                        if (fs.existsSync(absolutePath)) {
                            fs.unlinkSync(absolutePath);
                            console.log(`Deleted file: ${absolutePath}`);
                        } else {
                            console.warn(`File not found for deletion: ${absolutePath}`);
                        }
                    }
                } catch (err) {
                    console.error(`Failed to delete file for story ${story.id}:`, err);
                }
            }

            // Delete from DB
            await prisma.story.deleteMany({
                where: {
                    id: {
                        in: expiredStories.map(s => s.id)
                    }
                }
            });

            console.log('Expired stories deleted from DB.');

        } catch (error) {
            console.error('Error in story cleanup job:', error);
        }
    }, 60 * 60 * 1000); // 1 hour
}
