import fs from 'node:fs/promises';
import path from 'node:path';

async function loadEnv() {
  try {
    const env = await fs.readFile('.env', 'utf-8');

    for (const line of env.split('\n')) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '');

      process.env[key] ??= value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

await loadEnv();

const ALURA_API_URL = process.env.ALURA_API_URL;

if (!ALURA_API_URL) {
  console.error('Erro: ALURA_API_URL não configurada no .env');
  process.exit(1);
}

if (!ALURA_USERNAME) {
  console.error('Erro: ALURA_USERNAME não configurado no .env');
  process.exit(1);
}

async function main() {
  const response = await fetch(ALURA_API_URL);

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da Alura: ${response.status}`);
  }

  const data = await response.json();

  //console.log('courseProgresses existe?', Array.isArray(data.courseProgresses));
  //console.log('Quantidade em courseProgresses:', data.courseProgresses?.length);

  //console.log('Primeiro curso:');
  //console.log(data.courseProgresses?.[0]);

  const courses = (data.courseProgresses || [])
    .filter((course) => course.finished === true || course.progress === 100)
    .map((course) => ({
      id: course.id,
      name: course.name,
      slug: course.slug,
      progress: course.progress,
      finished: course.finished,
      platform: 'Alura',
      courseUrl: `https://www.alura.com.br/curso-online-${course.slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    updatedAt: new Date().toISOString(),
    totalCourses: courses.length,
    courses,
  };

  const outputPath = path.resolve(
    'src/assets/data/alura-courses.json'
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await fs.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    'utf-8'
  );

  console.log(`JSON gerado com ${courses.length} cursos concluídos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
