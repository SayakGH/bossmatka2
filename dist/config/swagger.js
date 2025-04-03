"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocs = void 0;
exports.swaggerDocs = {
    swagger: '2.0',
    info: {
        title: '',
        description: '',
        version: '1.0'
    },
    produces: [
        'application/json'
    ],
    host: '',
    basePath: '/api',
    tags: [
        {
            name: 'Configuration',
            description: 'Endpoints'
        }
    ],
    paths: {
        '/configuration': {
            get: {
                tags: [
                    'Configuration'
                ],
                description: 'Configuration get',
                parameters: [
                    {
                        in: 'query',
                        name: 'fields',
                        description: '',
                        required: false
                    }
                ],
                responses: {
                    200: {
                        description: 'Ok'
                    },
                    404: {
                        description: 'Not Found'
                    }
                }
            },
            post: {
                tags: [
                    'Configuration'
                ],
                description: 'Configuration Post',
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        description: '',
                        required: true,
                        schema: {
                            $ref: '#/definitions/configuration'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Ok'
                    },
                    404: {
                        description: 'Not Found'
                    }
                }
            }
        },
        '/configuration/update': {
            put: {
                tags: [
                    'Configuration'
                ],
                description: 'Update Configuration',
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        description: '',
                        required: true,
                        schema: {
                            $ref: '#/definitions/updateConfiguration'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Ok'
                    },
                    404: {
                        description: 'Not Found'
                    }
                }
            }
        },
        '/configuration/changeStatus': {
            post: {
                tags: [
                    'Configuration'
                ],
                description: 'Change Status of Configuration',
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        description: '',
                        required: true,
                        schema: {
                            $ref: '#/definitions/changeStatus'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Ok'
                    },
                    404: {
                        description: 'Not Found'
                    }
                }
            }
        },
    },
    definitions: {
        configuration: {
            type: 'object',
            properties: {
                'user.password.uppercase': {
                    type: 'string',
                    example: '5'
                }
            }
        },
        changeStatus: {
            type: 'object',
            properties: {
                'configurableKey': {
                    type: 'string',
                    example: 'exampleKey'
                },
                'isActive': {
                    type: 'number',
                    example: 0
                },
            }
        },
        location: {
            type: 'object',
            properties: {
                'name': {
                    type: 'string',
                    example: 'India'
                },
                'arabic': {
                    type: 'string',
                    example: 'India'
                },
                'code': {
                    type: 'int',
                    example: '560025'
                },
                'isActive': {
                    type: 'int',
                    example: 1
                },
                'countryId': {
                    type: 'int',
                    example: 1
                },
                'stateId': {
                    type: 'int',
                    example: 1
                },
                'districtId': {
                    type: 'int',
                    example: 1
                },
                'cityId': {
                    type: 'int',
                    example: 1
                }
            }
        },
        locationUpdate: {
            type: 'object',
            properties: {
                'name': {
                    type: 'string',
                    example: 'englishName'
                },
                'arabic': {
                    type: 'string',
                    example: 'arabicName'
                },
                'code': {
                    type: 'int',
                    example: 468921
                },
                'isActive': {
                    type: 'int',
                    example: 1
                },
                'id': {
                    type: 'int',
                    example: 1
                }
            }
        },
        updateConfiguration: {
            type: 'object',
            properties: {
                'configurableKey': {
                    type: 'string',
                    example: 'exampleKey'
                },
                'configurableKeyDisplayText': {
                    type: 'string',
                    example: 'Example Key'
                },
                'configurableValue': {
                    type: 'string',
                    example: 'exampleValue'
                },
                'configurableValueDisplayText': {
                    type: 'string',
                    example: 'Example Value'
                },
                'configurableUnit': {
                    type: 'string',
                    example: 'min'
                },
                'configurableType': {
                    type: 'string',
                    example: 'exampleType'
                },
                'configDatatype': {
                    type: 'string',
                    example: 'varchar'
                },
                'isActive': {
                    type: 'number',
                    example: 1
                },
            }
        },
        accessGroupCreate: {
            type: 'object',
            properties: {
                'name': {
                    type: 'string',
                    example: "GroupTest"
                },
                'description': {
                    type: 'string',
                    example: "get access for Configurator"
                },
                'accessRightsId': {
                    type: 'array',
                    example: [1, 2, 3]
                }
            }
        },
        accessGroupUpdate: {
            type: 'object',
            properties: {
                'id': {
                    type: 'int',
                    example: "9"
                },
                'name': {
                    type: 'string',
                    example: "GroupTest"
                },
                'description': {
                    type: 'string',
                    example: "get access for Configurator"
                },
                'accessRightsId': {
                    type: 'object',
                    example: {
                        "selectedAccessRightsId": [1, 2, 3, 4],
                        "removedAccessRightsId": [1]
                    }
                }
            },
        },
        accessRightCreate: {
            type: 'object',
            properties: {
                'module': {
                    type: 'string',
                    example: "shoppingCart"
                },
                'access': {
                    type: 'int',
                    example: 1
                },
            }
        },
        accessRightUpdate: {
            type: 'object',
            properties: {
                'id': {
                    type: 'int',
                    example: "3"
                },
                'module': {
                    type: 'string',
                    example: "User Management"
                },
                'access': {
                    type: 'int',
                    example: 1
                }
            }
        },
    }
};
//# sourceMappingURL=swagger.js.map