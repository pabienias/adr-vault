import type { AdrLinkType } from '../enums/adr-link-type';
import type { AdrStatus } from '../enums/adr-status';
import type { CreationMethod } from '../enums/creation-method';

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
