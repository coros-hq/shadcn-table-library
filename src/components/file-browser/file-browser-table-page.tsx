import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import filesSource from './files.ts?raw'
import fileIconSource from './file-icon.tsx?raw'
import fileDetailsSource from './file-details.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { FileBrowserDemo } from './index'
import vueFileBrowserDemoVueSource from '#/components/vue/file-browser/FileBrowserDemo.vue?raw'
import vueFileTableVueSource from '#/components/vue/file-browser/FileTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/file-browser/columns.ts?raw'
import vueFileDetailsVueSource from '#/components/vue/file-browser/FileDetails.vue?raw'
import vueFileIconVueSource from '#/components/vue/file-browser/FileIcon.vue?raw'
import vueFilesTsSource from '#/components/vue/file-browser/files.ts?raw'
import vueDataTsSource from '#/components/vue/file-browser/data.ts?raw'
import svelteFileBrowserDemoSvelteSource from '#/components/svelte/file-browser/FileBrowserDemo.svelte?raw'
import svelteFileTableSvelteSource from '#/components/svelte/file-browser/FileTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/file-browser/columns.ts?raw'
import svelteNameCellSvelteSource from '#/components/svelte/file-browser/NameCell.svelte?raw'
import svelteFileDetailsSvelteSource from '#/components/svelte/file-browser/FileDetails.svelte?raw'
import svelteFileIconSvelteSource from '#/components/svelte/file-browser/FileIcon.svelte?raw'
import svelteSortHeaderSvelteSource from '#/components/svelte/file-browser/SortHeader.svelte?raw'
import svelteSelectCheckboxSvelteSource from '#/components/svelte/file-browser/SelectCheckbox.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/file-browser/TextCell.svelte?raw'
import svelteFilesTsSource from '#/components/svelte/file-browser/files.ts?raw'
import svelteDataTsSource from '#/components/svelte/file-browser/data.ts?raw'

const files = [
  { path: 'src/components/file-browser/data.ts', code: dataSource },
  { path: 'src/components/file-browser/files.ts', code: filesSource },
  { path: 'src/components/file-browser/file-icon.tsx', code: fileIconSource },
  {
    path: 'src/components/file-browser/file-details.tsx',
    code: fileDetailsSource,
  },
  { path: 'src/components/file-browser/columns.tsx', code: columnsSource },
  { path: 'src/components/file-browser/data-table.tsx', code: dataTableSource },
  { path: 'src/components/file-browser/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/file-browser/FileBrowserDemo.vue',
    code: vueFileBrowserDemoVueSource,
  },
  {
    path: 'src/components/file-browser/FileTable.vue',
    code: vueFileTableVueSource,
  },
  {
    path: 'src/components/file-browser/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/file-browser/FileDetails.vue',
    code: vueFileDetailsVueSource,
  },
  {
    path: 'src/components/file-browser/FileIcon.vue',
    code: vueFileIconVueSource,
  },
  {
    path: 'src/components/file-browser/files.ts',
    code: vueFilesTsSource,
  },
  {
    path: 'src/components/file-browser/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['button', 'checkbox', 'table'],
  valueUpdater: true,
}

const svelteFiles = [
  {
    path: 'src/lib/components/file-browser/FileBrowserDemo.svelte',
    code: svelteFileBrowserDemoSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/FileTable.svelte',
    code: svelteFileTableSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/file-browser/NameCell.svelte',
    code: svelteNameCellSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/FileDetails.svelte',
    code: svelteFileDetailsSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/FileIcon.svelte',
    code: svelteFileIconSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/SortHeader.svelte',
    code: svelteSortHeaderSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/SelectCheckbox.svelte',
    code: svelteSelectCheckboxSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/file-browser/files.ts',
    code: svelteFilesTsSource,
  },
  {
    path: 'src/lib/components/file-browser/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['button', 'checkbox', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'The table shows one folder at a time',
    description:
      'The tree stays in one piece, and the table only gets the children of the open folder. The breadcrumbs are the path from the root to that folder, so every folder above is one click away.',
    file: 'src/components/file-browser/index.tsx',
    code: `const path = findPath(tree, folderId) ?? [tree]
const folder = path[path.length - 1]
<FileTable folder={folder} … />`,
  },
  {
    title: 'Folders stay on top',
    description:
      'Sorting by name, size or date reorders folders and files separately, so folders are always first, as in any file manager. The table runs with manualSorting and the entries are sorted before they reach it.',
    file: 'src/components/file-browser/files.ts',
    code: `return [...entries].sort((a, b) => {
  if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
  return by[sort.id](a, b) * dir || by.name(a, b)
})`,
  },
  {
    title: "A folder's name opens it, a file's name shows its details",
    description:
      'Only files can expand. The details row lists what the file is: dimensions, pages or duration depending on its type, then size, dates, owner, version, location and tags. On small screens the Type, Owner and Modified columns hide, and the details still have them.',
    file: 'src/components/file-browser/data-table.tsx',
    code: `getRowCanExpand: (row) => row.original.kind === 'file',`,
  },
  {
    title: 'Selection belongs to the folder',
    description:
      'Moving to another folder clears the selection and closes any details, so Delete never touches files you can no longer see. The bar above the table shows how many are selected and their total size.',
    file: 'src/components/file-browser/index.tsx',
    code: `setFolderId(id)
setRowSelection({})
setExpanded({})`,
  },
  {
    title: 'Focus follows you through the folders',
    description:
      'Opening a folder moves focus to its name in the breadcrumbs. Going back up focuses the folder you came out of, so keyboard and screen reader users keep their place.',
    file: 'src/components/file-browser/index.tsx',
    code: `focusNext.current = folder.id.startsWith(\`\${id}/\`)
  ? childToward(id, folder.id)
  : 'crumb'`,
  },
]

export function FileBrowserTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn File Browser Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Folders and files in a table: move through folders with the
            breadcrumbs, select files to download or delete, and expand a file
            to see its details.
          </p>
        </div>

        <InstallCommand name="file-browser-table" />

        <ComponentPreview
          preview={<FileBrowserDemo />}
          files={files}
          vueFiles={vueFiles}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
          vueDeps={vueDeps}
        />

        <div className="space-y-2">
          <h2 className="text-sm font-medium">How it works</h2>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <CodeBlock
                  filename={step.file}
                  code={step.code}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </DocsLayout>
  )
}
