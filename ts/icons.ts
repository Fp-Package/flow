const getIcon = (iconSvgHtmlString: string) => {
    const span = document.createElement('span');
    span.classList.add('fp-flowjs-controller-icon');
    span.innerHTML = iconSvgHtmlString;
    return span;
};

export interface IconParams {
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
}

const defaultIconParams: IconParams = {
    width: 16,
    height: 16,
    fill: 'currentColor',
};

export const DeleteIcon = (iconParams = defaultIconParams) => {
    const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="${iconParams.fill}" viewBox="0 0 24 24">
        <path d="M3 6h18v2H3V6zm3 4v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10H6zm2 2h2v8H8v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8zM15.5 4l1-1h-7l1 1H5v2h14V4z"/>
    </svg>
    `;
    return getIcon(icon);
};

export const EditIcon = (iconParams = defaultIconParams) => {
    const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="${iconParams.fill}" viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11z" />
        <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>

    `;
    return getIcon(icon);
}

export const ConnectionIcon = (iconParams = defaultIconParams) => {
    const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <polyline points="2,20 8,12 4,8 12,4 16,8 20,2" />
        <polyline points="18,3 20,2 19,4" />
    </svg>
    `;
    return getIcon(icon);
}