import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@zincir.com';
    const password = 'admin'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/updated:', admin.email);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
