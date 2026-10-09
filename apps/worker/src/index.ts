// M0 provides the worker package boundary, not an export implementation.
// Refuse startup rather than consuming jobs that cannot be rendered safely.
console.error(
  'Export worker is unavailable until the isolated renderer is implemented and validated in M4.',
);
process.exitCode = 1;
export {};
