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

function getRequiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    console.error(`Erro: ${key} não configurado no .env`);
    process.exit(1);
  }

  return value;
}

function isFinishedCourse(course) {
  return course.finished === true || course.progress === 100;
}

function buildCourseUrl(slug) {
  return `https://www.alura.com.br/curso-online-${slug}`;
}

function buildCertificateUrl(username, slug) {
  return `https://cursos.alura.com.br/user/${username}/course/${slug}/certificate`;
}

function normalizeCourse(course, username) {
  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    progress: course.progress,
    finished: course.finished,
    platform: 'Alura',
    courseUrl: buildCourseUrl(course.slug),
    certificateUrl: buildCertificateUrl(username, course.slug),
  };
}

async function fetchAluraData(apiUrl) {
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da Alura: ${response.status}`);
  }

  return response.json();
}

async function saveJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  await loadEnv();

  const ALURA_API_URL = getRequiredEnv('ALURA_API_URL');
  const ALURA_USERNAME = getRequiredEnv('ALURA_USERNAME');

  const data = await fetchAluraData(ALURA_API_URL);

  const courses = (data.courseProgresses || [])
    .filter(isFinishedCourse)
    .map((course) => normalizeCourse(course, ALURA_USERNAME))
    .sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    updatedAt: new Date().toISOString(),
    platform: 'Alura',
    totalCourses: courses.length,
    courses,
  };

  const outputPath = path.resolve('src/assets/data/alura-courses.json');

  await saveJsonFile(outputPath, output);

  console.log(`JSON gerado com ${courses.length} cursos concluídos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});