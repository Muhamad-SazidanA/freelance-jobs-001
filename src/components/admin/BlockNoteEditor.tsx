import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@mantine/core/styles.css';
import { useEffect, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FormattingToolbar,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useCreateBlockNote,
} from '@blocknote/react';
import { uploadMediaAsset } from './cmsClient';

export interface BlockNoteEditorProps {
  initialHTML?: string;
  onChange: (html: string) => void;
}

function StaticFormattingToolbar() {
  return (
    <div className="bn-static-toolbar">
      <FormattingToolbar>
        <BlockTypeSelect key="blockTypeSelect" />
        <div className="bn-toolbar-divider" />
        <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
        <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
        <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
        <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
        <BasicTextStyleButton basicTextStyle="code" key="codeStyleButton" />
        <div className="bn-toolbar-divider" />
        <ColorStyleButton key="colorStyleButton" />
        <CreateLinkButton key="createLinkButton" />
        <div className="bn-toolbar-divider" />
        <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
        <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
        <TextAlignButton textAlignment="right" key="textAlignRightButton" />
        <div className="bn-toolbar-divider" />
        <NestBlockButton key="nestBlockButton" />
        <UnnestBlockButton key="unnestBlockButton" />
      </FormattingToolbar>
    </div>
  );
}

function convertSemanticHTMLToBlockNoteHTML(htmlString: string): string {
  if (!htmlString || typeof window === 'undefined') return htmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  function transformDetails(detailsEl: HTMLElement) {
    const summary = detailsEl.querySelector('summary');
    if (!summary) return;

    const container = doc.createElement('div');
    container.setAttribute('data-content-type', 'toggleListItem');
    container.setAttribute('data-node-type', 'blockContainer');
    container.className = 'bn-block-container';

    const contentWrapper = doc.createElement('div');
    contentWrapper.className = 'bn-block-content';
    contentWrapper.setAttribute('data-node-type', 'blockContent');

    const content = doc.createElement('p');
    content.className = 'bn-inline-content';
    content.innerHTML = summary.innerHTML;

    contentWrapper.appendChild(content);
    container.appendChild(contentWrapper);

    const group = doc.createElement('div');
    group.className = 'bn-block-group';
    group.setAttribute('data-node-type', 'blockGroup');

    Array.from(detailsEl.childNodes).forEach((child) => {
      if (child !== summary) {
        group.appendChild(child.cloneNode(true));
      }
    });

    Array.from(group.querySelectorAll('details')).forEach((nested) =>
      transformDetails(nested as HTMLElement)
    );

    if (group.childNodes.length > 0) {
      container.appendChild(group);
    }

    detailsEl.parentNode?.replaceChild(container, detailsEl);
  }

  Array.from(doc.querySelectorAll('details')).forEach((details) => {
    if (!details.parentElement?.closest('details')) {
      transformDetails(details as HTMLElement);
    }
  });

  return doc.body.innerHTML;
}

function convertFullHTMLToSemanticHTML(htmlString: string): string {
  if (!htmlString || typeof window === 'undefined') return htmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const resultFragment = doc.createDocumentFragment();

  function processBlockGroup(groupEl: Element): Node {
    const fragment = doc.createDocumentFragment();
    let activeList: HTMLElement | null = null;
    let activeListType: string | null = null;

    const closeList = (newType: string | null) => {
      if (activeList && activeListType !== newType) {
        fragment.appendChild(activeList);
        activeList = null;
        activeListType = null;
      }
    };

    for (const container of Array.from(groupEl.children)) {
      let blockContainer = container;
      if (container.classList.contains('bn-block-outer')) {
        blockContainer = container.querySelector('.bn-block') ?? container;
      }

      const contentEl = blockContainer.querySelector('.bn-block-content');
      if (!contentEl) continue;

      const contentType = contentEl.getAttribute('data-content-type');
      const childGroupEl = blockContainer.querySelector('.bn-block-group');
      const innerContent = contentEl.querySelector('.bn-inline-content') ?? contentEl;
      const innerHTML = innerContent.innerHTML;

      if (contentType === 'bulletListItem' || contentType === 'numberedListItem') {
        const listKind = contentType === 'bulletListItem' ? 'UL' : 'OL';
        closeList(listKind);
        if (!activeList) {
          activeList = doc.createElement(listKind === 'UL' ? 'ul' : 'ol');
          activeListType = listKind;
        }
        const li = doc.createElement('li');
        li.innerHTML = innerHTML;
        if (childGroupEl) {
          li.appendChild(processBlockGroup(childGroupEl));
        }
        activeList.appendChild(li);
      } else if (contentType === 'checkListItem') {
        closeList('CHECK-UL');
        if (!activeList) {
          activeList = doc.createElement('ul');
          activeList.className = 'checklist';
          activeListType = 'CHECK-UL';
        }
        const li = doc.createElement('li');
        li.className = 'checklist-item';
        const checkbox = doc.createElement('input');
        checkbox.type = 'checkbox';
        const isChecked = blockContainer.getAttribute('data-checked') === 'true';
        checkbox.checked = isChecked;
        if (isChecked) checkbox.setAttribute('checked', '');
        li.appendChild(checkbox);
        const span = doc.createElement('span');
        span.innerHTML = innerHTML;
        li.appendChild(span);
        if (childGroupEl) {
          li.appendChild(processBlockGroup(childGroupEl));
        }
        activeList.appendChild(li);
      } else if (contentType === 'toggleListItem') {
        closeList(null);
        const details = doc.createElement('details');
        details.className = 'toggle-list-item';
        const summary = doc.createElement('summary');
        summary.innerHTML = innerHTML;
        details.appendChild(summary);
        if (childGroupEl) {
          details.appendChild(processBlockGroup(childGroupEl));
        }
        fragment.appendChild(details);
      } else if (contentType === 'quote') {
        closeList(null);
        const blockquote = doc.createElement('blockquote');
        blockquote.innerHTML = innerHTML;
        if (childGroupEl) {
          blockquote.appendChild(processBlockGroup(childGroupEl));
        }
        fragment.appendChild(blockquote);
      } else {
        closeList(null);
        const clonedContent = doc.createElement(innerContent.tagName);
        Array.from(innerContent.attributes).forEach((attr) => {
          if (attr.name === 'class') {
            const cleanClasses = attr.value
              .split(' ')
              .filter((cls) => !cls.startsWith('bn-'))
              .join(' ');
            if (cleanClasses) clonedContent.setAttribute('class', cleanClasses);
          } else {
            clonedContent.setAttribute(attr.name, attr.value);
          }
        });
        clonedContent.innerHTML = innerHTML;
        fragment.appendChild(clonedContent);
        if (childGroupEl) {
          fragment.appendChild(processBlockGroup(childGroupEl));
        }
      }
    }

    if (activeList) {
      fragment.appendChild(activeList);
    }
    return fragment;
  }

  let rootGroup = doc.body.querySelector('.bn-block-group') ?? doc.body;
  if (rootGroup && rootGroup !== doc.body && rootGroup.parentElement !== doc.body) {
    rootGroup = doc.body;
  }
  resultFragment.appendChild(processBlockGroup(rootGroup));

  const tempDiv = doc.createElement('div');
  tempDiv.appendChild(resultFragment);
  return tempDiv.innerHTML;
}

export default function BlockNoteEditor({ initialHTML, onChange }: BlockNoteEditorProps) {
  const [isReady, setIsReady] = useState(false);

  const editor = useCreateBlockNote({
    uploadFile: uploadMediaAsset,
  });

  useEffect(() => {
    let active = true;
    if (initialHTML) {
      try {
        const cleanHtml = convertSemanticHTMLToBlockNoteHTML(initialHTML);
        const blocks = editor.tryParseHTMLToBlocks(cleanHtml);
        if (active && Array.isArray(blocks) && blocks.length > 0) {
          editor.replaceBlocks(editor.document, blocks);
        }
      } catch (err) {
        console.error('Error parsing HTML to blocks:', err);
      }
    }
    setIsReady(true);
    return () => {
      active = false;
    };
  }, [editor]);

  const handleEditorChange = () => {
    try {
      const fullHtml = editor.blocksToFullHTML(editor.document);
      onChange(convertFullHTMLToSemanticHTML(fullHtml));
    } catch (err) {
      console.error('Error converting blocks to HTML:', err);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8 border border-slate-200 rounded-xl bg-slate-50 min-h-[340px]">
        <span className="text-slate-500 text-xs font-medium">Menyiapkan editor visual...</span>
      </div>
    );
  }

  return (
    <MantineProvider defaultColorScheme="light">
      <div className="bn-editor-wrapper border border-slate-200 rounded-xl min-h-[360px] bg-white text-slate-900 overflow-hidden shadow-xs">
        <BlockNoteView
          editor={editor}
          onChange={handleEditorChange}
          theme="light"
          formattingToolbar={false}
          sideMenu={true}
        >
          <StaticFormattingToolbar />
        </BlockNoteView>
      </div>
    </MantineProvider>
  );
}
