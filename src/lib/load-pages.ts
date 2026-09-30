import { planPages, type Page } from './pages';
import { getLegal, getPosts, getServices } from './queries';

export async function loadPages(): Promise<Page[]> {
  const [services, posts, legal] = await Promise.all([getServices(), getPosts(), getLegal()]);
  return planPages({ services, posts, legal });
}
