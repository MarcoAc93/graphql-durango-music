import { readFileSync } from 'fs';

const schema = readFileSync(require.resolve('./schema.graphql'), { encoding: 'utf-8' });

export default `
${schema}
`;
