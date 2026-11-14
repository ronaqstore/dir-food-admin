export type RouteParamsId = {
  id: string;
};

export type RouteIdContext = {
  params: Promise<RouteParamsId>;
};

export type RouteKindContext = {
  params: Promise<RouteKindContextParams>;
};

export type RouteKindContextParams = {
  kind: string;
};

