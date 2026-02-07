# Passing project this way was necessary before fine-tuning the way the command
# options are executed.
project=$(functions project) \
DEV=true \
npx tsx \
  --watch examples/use-focus-with-id/use-focus-with-id.tsx \
  "Branch:project branch" \
  "Examples:project_examples" \
  "Env:env >> /tmp/use-focus-with-id-env.log" \
  "which project:which project" \
  "project:${project}"



DEV=true \
npx tsx \
  --watch examples/use-focus-with-id/use-focus-with-id.tsx \
  "Branch:project branch" \
  "Examples:project_examples" \
  "Env:env >> /tmp/use-focus-with-id-env.log" \
  "which project:which project" \
  "project:${project}"

