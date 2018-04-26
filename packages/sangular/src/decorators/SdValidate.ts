import {Type} from "@angular/core";
import {ArgumentsException} from "../../../core/src";

// tslint:disable-next-line:variable-name
export const SdValidate = (params?: PropertyCheckerTypes | PropertyCheckerTypes[] | {
    type?: PropertyCheckerTypes | PropertyCheckerTypes[];
    notnull?: boolean;

    validator?(value: any): boolean;
}) => (target: any, propertyKey: string) => {
    const getter = function (this: any): any {
        if (!this) return;
        return this[`__sd_${propertyKey}__`];
    };
    const setter = function (this: any, value: any): void {
        if (!this) return;

        let config;
        if (params instanceof Array) {
            config = {type: params};
        }
        else if (params instanceof Type || params === "SdThemeString" || params === "SdSizeString") {
            config = {type: [params]};
        }
        else if (!((params as any).type instanceof Array)) {
            config = {
                ...(params as any),
                type: [(params as any).type]
            };
        }
        else {
            config = params;
        }

        if (value == undefined) {
            if (config.notnull) {
                throw new ArgumentsException({propertyKey, value, notnull: config.notnull});
            }
            this[`__sd_${propertyKey}__`] = value;
            return;
        }

        if (config.type) {
            if (
                !config.type.some((type: any) =>
                    type === value.constructor ||
                    (type === "SdThemeString" && ["primary", "warning", "danger", "info", "success"].includes(value)) ||
                    (type === "SdSizeString" && ["xxs", "xs", "sm", "lg", "xl", "xxl"].includes(value))
                )
            ) {
                throw new ArgumentsException({propertyKey, value, type: config.type});
            }
        }

        if (config.validator) {
            if (!config.validator(value)) {
                throw new ArgumentsException({propertyKey, value, validator: config.validator});
            }
        }

        this[`__sd_${propertyKey}__`] = value;
    };

    setter(target[propertyKey]);

    if (delete target[propertyKey]) {
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
};

export type PropertyCheckerTypes = Type<any> | "SdThemeString" | "SdSizeString";