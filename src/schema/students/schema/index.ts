import { readFileSync } from 'fs';

const query = readFileSync(require.resolve('./query.graphql'), { encoding: 'utf-8' });
const mutation = readFileSync(require.resolve('./mutation.graphql'), { encoding: 'utf-8' });

export default `
${query}
${mutation}
`;
