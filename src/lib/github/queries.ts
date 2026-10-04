// GraphQL documents, REST routes and the shape of what they return.
// Nodes are nullable throughout: GitHub returns null for anything the token
// cannot read (see partialData in client.ts).

const REPO_FIELDS = /* GraphQL */ `
    fragment RepoFields on Repository {
        nameWithOwner
        name
        description
        url
        homepageUrl
        isArchived
        isPrivate
        pushedAt
        createdAt
        stargazerCount
        repositoryTopics(first: 20) {
            nodes {
                topic {
                    name
                }
            }
        }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges {
                size
                node {
                    name
                }
            }
        }
        latestRelease {
            tagName
            name
            publishedAt
            isPrerelease
            isDraft
            url
        }
        releases(last: 20) {
            nodes {
                tagName
                name
                publishedAt
                isPrerelease
                isDraft
                url
            }
        }
    }
`;

/** Repos carrying a topic, across owners. `$q` comes from topicSearchQuery(). */
export const REPOS_BY_TOPIC = /* GraphQL */ `
    query ReposByTopic($q: String!, $after: String) {
        search(query: $q, type: REPOSITORY, first: 50, after: $after) {
            repositoryCount
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                ...RepoFields
            }
        }
    }
    ${REPO_FIELDS}
`;

/** One repo by name — for systems declared only in the content repo. */
export const REPO_BY_NAME = /* GraphQL */ `
    query RepoByName($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            ...RepoFields
        }
    }
    ${REPO_FIELDS}
`;

const FILE_FIELDS = /* GraphQL */ `
    fragment FileFields on GitObject {
        __typename
        ... on Blob {
            text
            isBinary
        }
        ... on Tree {
            entries {
                name
                type
                object {
                    ... on Blob {
                        text
                        isBinary
                    }
                }
            }
        }
    }
`;

/**
 * Reads `count` paths from one repo in a single request. Each `$eN` is a git
 * expression such as "HEAD:.portfolio/system.json"; a blob returns its text,
 * a tree returns its entries with the text of each file. Missing paths are null.
 */
export function repoFilesQuery(count: number) {
    const indexes = Array.from({ length: count }, (_, i) => i);

    return /* GraphQL */ `
        query RepoFiles($owner: String!, $name: String!, ${indexes
            .map((i) => `$e${i}: String!`)
            .join(", ")}) {
            repository(owner: $owner, name: $name) {
                ${indexes
                    .map((i) => `f${i}: object(expression: $e${i}) { ...FileFields }`)
                    .join("\n                ")}
            }
        }
        ${FILE_FIELDS}
    `;
}

/** A single file or folder. */
export const REPO_FILE = repoFilesQuery(1);

/** Merged PRs by the owner. `$q` comes from prSearchQuery(). */
export const MERGED_PRS = /* GraphQL */ `
    query MergedPrs($q: String!, $after: String) {
        search(query: $q, type: ISSUE, first: 50, after: $after) {
            issueCount
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                ... on PullRequest {
                    number
                    title
                    body
                    mergedAt
                    url
                    additions
                    deletions
                    changedFiles
                    labels(first: 10) {
                        nodes {
                            name
                        }
                    }
                    repository {
                        nameWithOwner
                    }
                }
            }
        }
    }
`;

/** Just the number of merged PRs matching `$q`. */
export const MERGED_PR_COUNT = /* GraphQL */ `
    query MergedPrCount($q: String!) {
        search(query: $q, type: ISSUE, first: 1) {
            issueCount
        }
    }
`;

/**
 * Pull requests of one repo by number, in a single request. A number that
 * does not exist comes back as null.
 */
export function pullRequestsQuery(count: number) {
    const indexes = Array.from({ length: count }, (_, i) => i);

    return /* GraphQL */ `
        query PullRequestsByNumber($owner: String!, $name: String!, ${indexes
            .map((i) => `$n${i}: Int!`)
            .join(", ")}) {
            repository(owner: $owner, name: $name) {
                ${indexes
                    .map(
                        (i) =>
                            `p${i}: pullRequest(number: $n${i}) { number title mergedAt url additions deletions }`
                    )
                    .join("\n                ")}
            }
        }
    `;
}

export const USER_PROFILE = /* GraphQL */ `
    query UserProfile($login: String!) {
        user(login: $login) {
            login
            name
            bio
            location
            websiteUrl
            avatarUrl
            url
            createdAt
        }
    }
`;

/** Contributions in a window of at most one year. Called once per year, and for the "now" windows. */
export const CONTRIBUTIONS = /* GraphQL */ `
    query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
                totalCommitContributions
                totalPullRequestContributions
                totalPullRequestReviewContributions
                totalRepositoryContributions
                totalRepositoriesWithContributedCommits
                commitContributionsByRepository(maxRepositories: 10) {
                    repository {
                        nameWithOwner
                        isPrivate
                        primaryLanguage {
                            name
                        }
                    }
                    contributions {
                        totalCount
                    }
                }
                contributionCalendar {
                    totalContributions
                }
            }
        }
    }
`;

export const RECENT_STARS = /* GraphQL */ `
    query RecentStars($login: String!) {
        user(login: $login) {
            starredRepositories(
                first: 30
                orderBy: { field: STARRED_AT, direction: DESC }
            ) {
                edges {
                    starredAt
                    node {
                        nameWithOwner
                        repositoryTopics(first: 10) {
                            nodes {
                                topic {
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

/** Public activity feed. Params: { username, per_page }. */
export const EVENTS_ROUTE = "GET /users/{username}/events/public";

/** Commits by one author since a date. Params: { owner, repo, author, since, per_page }. */
export const COMMITS_ROUTE = "GET /repos/{owner}/{repo}/commits";

export function topicSearchQuery(topic: string, owners: string[]) {
    // fork:true = include forks as well as sources.
    return `topic:${topic} ${owners.map((owner) => `user:${owner}`).join(" ")} fork:true`;
}

export function prSearchQuery(login: string, repos: string[], mergedSince?: Date) {
    return [
        "is:pr is:merged",
        `author:${login}`,
        ...repos.map((repo) => `repo:${repo}`),
        mergedSince && `merged:>=${mergedSince.toISOString().slice(0, 10)}`,
        "sort:created-desc"
    ]
        .filter(Boolean)
        .join(" ");
}

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type ReleaseNode = {
    tagName: string;
    name: string | null;
    publishedAt: string | null;
    isPrerelease: boolean;
    isDraft: boolean;
    url: string;
};

export type RepoNode = {
    nameWithOwner: string;
    name: string;
    description: string | null;
    url: string;
    homepageUrl: string | null;
    isArchived: boolean;
    isPrivate: boolean;
    pushedAt: string | null;
    createdAt: string;
    stargazerCount: number;
    repositoryTopics: { nodes: ({ topic: { name: string } } | null)[] };
    languages: {
        totalSize: number;
        edges: ({ size: number; node: { name: string } } | null)[];
    } | null;
    latestRelease: ReleaseNode | null;
    releases: { nodes: (ReleaseNode | null)[] };
};

export type ReposByTopicResponse = {
    search: {
        repositoryCount: number;
        pageInfo: PageInfo;
        nodes: (RepoNode | null)[];
    };
};

export type RepoByNameResponse = { repository: RepoNode | null };

export type FileObject =
    | { __typename: "Blob"; text: string | null; isBinary: boolean | null }
    | {
          __typename: "Tree";
          entries: {
              name: string;
              type: string;
              object: { text?: string | null; isBinary?: boolean | null } | null;
          }[];
      }
    | { __typename: string };

export type RepoFilesResponse = {
    repository: Record<string, FileObject | null> | null;
};

export type PullRequestNode = {
    number: number;
    title: string;
    body: string;
    mergedAt: string;
    url: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    labels: { nodes: ({ name: string } | null)[] } | null;
    repository: { nameWithOwner: string };
};

export type MergedPrsResponse = {
    search: {
        issueCount: number;
        pageInfo: PageInfo;
        // Empty objects are non-PR results; null is an unreadable PR.
        nodes: (Partial<PullRequestNode> | null)[];
    };
};

export type PullRequestByNumberNode = {
    number: number;
    title: string;
    /** null while open, or closed without merging. */
    mergedAt: string | null;
    url: string;
    additions: number;
    deletions: number;
};

export type PullRequestsByNumberResponse = {
    repository: Record<string, PullRequestByNumberNode | null> | null;
};

export type MergedPrCountResponse = { search: { issueCount: number } };

export type UserNode = {
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    websiteUrl: string | null;
    avatarUrl: string;
    url: string;
    createdAt: string;
};

export type UserProfileResponse = { user: UserNode | null };

export type ContributionsNode = {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoryContributions: number;
    totalRepositoriesWithContributedCommits: number;
    commitContributionsByRepository: {
        repository: {
            nameWithOwner: string;
            isPrivate: boolean;
            primaryLanguage: { name: string } | null;
        };
        contributions: { totalCount: number };
    }[];
    contributionCalendar: { totalContributions: number };
};

export type ContributionsResponse = {
    user: { contributionsCollection: ContributionsNode } | null;
};

export type StarEdge = {
    starredAt: string;
    node: {
        nameWithOwner: string;
        repositoryTopics: { nodes: ({ topic: { name: string } } | null)[] };
    };
};

export type RecentStarsResponse = {
    user: { starredRepositories: { edges: (StarEdge | null)[] } } | null;
};

/** The parts of a public event the site reads. Payload fields vary by type and API version. */
export type EventNode = {
    id: string;
    type: string | null;
    created_at: string | null;
    repo: { name: string };
    payload: {
        action?: string;
        ref?: string;
        commits?: { message: string }[];
        pull_request?: { title?: string; html_url?: string; merged?: boolean; number?: number };
        release?: { name?: string | null; tag_name?: string; html_url?: string };
    };
};
