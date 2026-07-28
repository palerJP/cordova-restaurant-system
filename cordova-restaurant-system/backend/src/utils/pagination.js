const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

/**
 * Parses page/limit query params into safe SQL OFFSET/LIMIT values,
 * clamped to sane bounds so a client can't request LIMIT 999999999.
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_PAGE_SIZE;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPageMeta({ page, limit, totalCount }) {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    hasNextPage: page * limit < totalCount,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPageMeta, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
