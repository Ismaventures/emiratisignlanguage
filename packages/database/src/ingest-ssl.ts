import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Saudi Sign Language Dataset Ingestion...');

  // Ensure an admin user exists to own the dataset
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emirsign.ai' },
    update: {},
    create: {
      email: 'admin@emirsign.ai',
      passwordHash: '$2b$12$LJ3m4ys3Lz0QfQqQQqQqQeQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create the Dataset
  const dataset = await prisma.dataset.create({
    data: {
      name: 'Saudi Sign Language (Isharah Subset)',
      description: 'Open-source benchmark subset from Isharah CSLR for testing avatar procedural animations.',
      language: 'ar-SA',
      version: 1,
      status: 'READY',
      createdBy: admin.id,
    },
  });

  console.log(`Created Dataset ID: ${dataset.id}`);

  // Read the dataset JSON
  const dataPath = path.join(__dirname, '../data/isharah_sample.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const items = JSON.parse(rawData);

  let annotationCount = 0;

  for (const item of items) {
    // Mock the video entry (since we are procedurally animating, video might be missing)
    const video = await prisma.datasetVideo.create({
      data: {
        datasetId: dataset.id,
        storageKey: `datasets/isharah/${item.videoId}.mp4`,
        durationMs: item.durationMs,
        lighting: 'Studio',
        angle: 'Front',
      },
    });

    // Create the annotation containing the procedural parameters (handshape, movement, etc.)
    await prisma.datasetAnnotation.create({
      data: {
        videoId: video.id,
        frameNumber: 0,
        landmarksJson: JSON.stringify(item.landmarksJson),
        gestureLabel: item.gestureLabel,
        sentenceLabel: item.arabicText,
        annotatedBy: admin.id,
      },
    });
    
    annotationCount++;
  }

  console.log(`Successfully ingested ${annotationCount} SSL annotations!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Ingestion Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
