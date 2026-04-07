import type { AdrLinkType } from '../enums/adr-link-type.js';
import type { AdrStatus } from '../enums/adr-status.js';
import type { CreationMethod } from '../enums/creation-method.js';

export interface Adr {
	id: string;
	adrNumber: number;
	title: string;
	status: AdrStatus;
	content: Record<string, unknown>;
	aiSummary: string | null;
	creationMethod: CreationMethod;
	authorId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface AdrLink {
	id: string;
	sourceAdrId: string;
	targetAdrId: string;
	linkType: AdrLinkType;
	createdAt: string;
}
