//todo: extract tags from a string of markdown
//todo: modify tags from a string of markdown


const TAG_REGEX = /#[\w\.]+/g;
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;


const extractTags = (content: string): string[] => {
    const nonCodeBlockParts = content.split(CODE_BLOCK_REGEX);
    const tags: string[] = [];

    nonCodeBlockParts.forEach(part => {
        const matches = part.match(TAG_REGEX);
        if (matches) {
            tags.push(...matches);
        }
    })
    return tags;
}


const modifyTags = (content: string, tag: string, newTag: string): string => {
    const tagRegex = new RegExp(`#${tag}\\b`, 'g');
    const codeParts = content.match(CODE_BLOCK_REGEX) || [];
    const nonCodeParts = content.split(CODE_BLOCK_REGEX).map(part => part.replace(tagRegex, `#${newTag}`));
    let finalParts = [];
    for (let i = 0; i < nonCodeParts.length; i++) {
        finalParts.push(nonCodeParts[i]);
        if (codeParts[i]) {
            finalParts.push(codeParts[i]);
        }
    }
    return finalParts.join('');
}


/**
 * Replace tags in the content with the given html tag. It deson't convert the tag in code blocks.
 * @param content rendered content
 */
const tagToHtml = (content: string, html: string): string => {
    const codeParts = content.match(CODE_BLOCK_REGEX) || [];
    const nonCodeParts = content.split(CODE_BLOCK_REGEX).map(part => part.replace(TAG_REGEX, html));
    let finalParts = [];
    for (let i = 0; i < nonCodeParts.length; i++) {
        finalParts.push(nonCodeParts[i]);
        if (codeParts[i]) {
            finalParts.push(codeParts[i]);
        }
    }
    return finalParts.join('');
}
export { extractTags, modifyTags, tagToHtml }