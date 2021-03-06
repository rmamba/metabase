/* @flow */

import React from "react";

import _ from "underscore";
import { t } from "ttag";

import * as Q_DEPRECATED from "metabase/lib/query";
import * as AGGREGATION from "metabase/lib/query/aggregation";

import { getAggregationOperator } from "metabase/lib/schema_metadata";
import { format } from "metabase/lib/expressions/format";

import FieldName from "./FieldName";

import type { Aggregation } from "metabase/meta/types/Query";
import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import AggregationWrapper from "metabase-lib/lib/queries/structured/Aggregation";
import { DISPLAY_QUOTES } from "../../lib/expressions";

type Props = {
  aggregation: Aggregation | AggregationWrapper,
  query: StructuredQuery,
  className?: string,
  // DEPRECATED: replaced with 'aggregation' / 'query`
  tableMetadata?: any,
  customFields?: any,
};

const AggregationName = ({
  className,
  aggregation,
  query = aggregation instanceof AggregationWrapper
    ? aggregation.query()
    : // $FlowFixMe
      null,
  // DEPRECATED: replaced with 'aggregation' / 'query`
  tableMetadata = query && query.tableMetadata(),
  customFields = query && query.expressions(),
}: Props) => {
  if (!tableMetadata) {
    return null;
  }
  if (AGGREGATION.hasOptions(aggregation)) {
    if (AGGREGATION.isNamed(aggregation)) {
      return (
        <NamedAggregation aggregation={aggregation} className={className} />
      );
    }
    aggregation = AGGREGATION.getContent(aggregation);
  }
  return AGGREGATION.isCustom(aggregation) && !isRows(aggregation) ? (
    <CustomAggregation
      query={query}
      aggregation={aggregation}
      tableMetadata={tableMetadata}
      customFields={customFields}
      className={className}
    />
  ) : AGGREGATION.isMetric(aggregation) ? (
    <MetricAggregation
      aggregation={aggregation}
      tableMetadata={tableMetadata}
      className={className}
    />
  ) : (
    <StandardAggregation
      aggregation={aggregation}
      tableMetadata={tableMetadata}
      customFields={customFields}
      className={className}
    />
  );
};

const NamedAggregation = ({ aggregation, className }) => (
  <span className={className}>{AGGREGATION.getName(aggregation)}</span>
);

const CustomAggregation = ({ aggregation, query, className }) => (
  <span className={className}>
    {format(aggregation, { query, quotes: DISPLAY_QUOTES })}
  </span>
);

const MetricAggregation = ({ aggregation, tableMetadata, className }) => {
  const metricId = AGGREGATION.getMetric(aggregation);
  const selectedMetric = _.findWhere(tableMetadata.metrics, { id: metricId });
  if (selectedMetric) {
    return (
      <span className={className}>
        {selectedMetric.name.replace(" of ...", "")}
      </span>
    );
  } else {
    return <span className={className}>{t`Invalid`}</span>;
  }
};

const StandardAggregation = ({
  aggregation,
  tableMetadata,
  customFields,
  className,
}) => {
  const fieldId = AGGREGATION.getField(aggregation);

  const selectedAggregation = getAggregationOperator(
    AGGREGATION.getOperator(aggregation),
  );
  // if this table doesn't support the selected aggregation, prompt the user to select a different one
  if (
    selectedAggregation &&
    _.findWhere(tableMetadata.aggregation_operators, {
      short: selectedAggregation.short,
    })
  ) {
    return (
      <span className={className}>
        {selectedAggregation.name.replace(" of ...", "")}
        {fieldId && <span className="text-bold"> {t`of`} </span>}
        {fieldId && (
          <FieldName
            field={fieldId}
            tableMetadata={tableMetadata}
            fieldOptions={Q_DEPRECATED.getFieldOptions(
              tableMetadata.fields,
              true,
            )}
            customFieldOptions={customFields}
          />
        )}
      </span>
    );
  } else {
    return <span>{t`Invalid`}</span>;
  }
};

const isRows = aggregation => aggregation && aggregation[0] === "rows";

export default AggregationName;
