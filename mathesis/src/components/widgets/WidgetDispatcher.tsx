import React from "react";
import { SecantWidget } from "./SecantWidget";
import { TangentWidget } from "./TangentWidget";
import { PlotterWidget } from "./PlotterWidget";
import { ChainWidget } from "./ChainWidget";
import { CircleWidget } from "./CircleWidget";
import { DerivLabWidget } from "./DerivLabWidget";
import { ExtremaWidget } from "./ExtremaWidget";
import { BoxWidget } from "./BoxWidget";
import { LadderWidget } from "./LadderWidget";
import { FamilyWidget } from "./FamilyWidget";
import { RiemannWidget } from "./RiemannWidget";
import { FTCWidget } from "./FTCWidget";
import { AreaWidget } from "./AreaWidget";
import { RevolveWidget } from "./RevolveWidget";
import { SlopeFieldWidget } from "./SlopeFieldWidget";
import { TaylorSeriesWidget } from "./TaylorSeriesWidget";
import { GradientWidget } from "./GradientWidget";
import { MatrixTransformWidget } from "./MatrixTransformWidget";

interface WidgetDispatcherProps {
  id: string;
  props?: Record<string, any>;
}

export const WidgetDispatcher: React.FC<WidgetDispatcherProps> = ({ id, props = {} }) => {
  switch (id) {
    case "secant":
      return <SecantWidget {...props} />;
    case "tangent":
      return <TangentWidget {...props} />;
    case "plotter":
      return <PlotterWidget {...props} />;
    case "chain":
      return <ChainWidget {...props} />;
    case "circle":
      return <CircleWidget {...props} />;
    case "derivlab":
      return <DerivLabWidget {...props} />;
    case "extrema":
      return <ExtremaWidget {...props} />;
    case "box":
      return <BoxWidget {...props} />;
    case "ladder":
      return <LadderWidget {...props} />;
    case "family":
      return <FamilyWidget {...props} />;
    case "riemann":
      return <RiemannWidget {...props} />;
    case "ftc":
      return <FTCWidget {...props} />;
    case "area":
      return <AreaWidget {...props} />;
    case "revolve":
      return <RevolveWidget {...props} />;
    case "slopefield":
      return <SlopeFieldWidget {...props} />;
    case "taylor":
      return <TaylorSeriesWidget {...props} />;
    case "gradient":
      return <GradientWidget {...props} />;
    case "matrix":
      return <MatrixTransformWidget {...props} />;
    default:
      return null;
  }
};
