import { Injectable } from '@nestjs/common';

@Injectable()
export class GravityCorrection {

    items = [
        {
          "Temp_Farenheit": -50,
          "0.500": 1.16,
          "0.510": 1.153,
          "0.520": 1.146,
          "0.530": 1.14,
          "0.540": 1.133,
          "0.550": 1.127,
          "0.560": 1.122,
          "0.570": 1.116,
          "0.580": 1.111,
          "0.590": 1.106
        },
        {
          "Temp_Farenheit": -45,
          "0.500": 1.153,
          "0.510": 1.146,
          "0.520": 1.14,
          "0.530": 1.134,
          "0.540": 1.128,
          "0.550": 1.122,
          "0.560": 1.117,
          "0.570": 1.111,
          "0.580": 1.106,
          "0.590": 1.101
        },
        {
          "Temp_Farenheit": -40,
          "0.500": 1.147,
          "0.510": 1.14,
          "0.520": 1.134,
          "0.530": 1.128,
          "0.540": 1.22,
          "0.550": 1.117,
          "0.560": 1.111,
          "0.570": 1.106,
          "0.580": 1.101,
          "0.590": 1.097
        },
        {
          "Temp_Farenheit": -35,
          "0.500": 1.14,
          "0.510": 1.134,
          "0.520": 1.128,
          "0.530": 1.122,
          "0.540": 1.116,
          "0.550": 1.112,
          "0.560": 1.106,
          "0.570": 1.101,
          "0.580": 1.096,
          "0.590": 1.092
        },
        {
          "Temp_Farenheit": -30,
          "0.500": 1.134,
          "0.510": 1.128,
          "0.520": 1.122,
          "0.530": 1.116,
          "0.540": 1.111,
          "0.550": 1.106,
          "0.560": 1.101,
          "0.570": 1.096,
          "0.580": 1.092,
          "0.590": 1.088
        },
        {
          "Temp_Farenheit": -25,
          "0.500": 1.127,
          "0.510": 1.121,
          "0.520": 1.115,
          "0.530": 1.11,
          "0.540": 1.105,
          "0.550": 1.1,
          "0.560": 1.095,
          "0.570": 1.091,
          "0.580": 1.087,
          "0.590": 1.083
        },
        {
          "Temp_Farenheit": -20,
          "0.500": 1.12,
          "0.510": 1.114,
          "0.520": 1.109,
          "0.530": 1.104,
          "0.540": 1.099,
          "0.550": 1.095,
          "0.560": 1.09,
          "0.570": 1.086,
          "0.580": 1.082,
          "0.590": 1.079
        },
        {
          "Temp_Farenheit": -15,
          "0.500": 1.112,
          "0.510": 1.107,
          "0.520": 1.102,
          "0.530": 1.097,
          "0.540": 1.093,
          "0.550": 1.089,
          "0.560": 1.084,
          "0.570": 1.08,
          "0.580": 1.077,
          "0.590": 1.074
        },
        {
          "Temp_Farenheit": -10,
          "0.500": 1.105,
          "0.510": 1.1,
          "0.520": 1.095,
          "0.530": 1.091,
          "0.540": 1.087,
          "0.550": 1.083,
          "0.560": 1.079,
          "0.570": 1.075,
          "0.580": 1.072,
          "0.590": 1.069
        },
        {
          "Temp_Farenheit": -5,
          "0.500": 1.098,
          "0.510": 1.094,
          "0.520": 1.089,
          "0.530": 1.085,
          "0.540": 1.081,
          "0.550": 1.077,
          "0.560": 1.074,
          "0.570": 1.07,
          "0.580": 1.067,
          "0.590": 1.065
        },
        {
          "Temp_Farenheit": 0,
          "0.500": 1.092,
          "0.510": 1.088,
          "0.520": 1.084,
          "0.530": 1.08,
          "0.540": 1.076,
          "0.550": 1.073,
          "0.560": 1.069,
          "0.570": 1.066,
          "0.580": 1.063,
          "0.590": 1.061
        },
        {
          "Temp_Farenheit": 2,
          "0.500": 1.089,
          "0.510": 1.085,
          "0.520": 1.081,
          "0.530": 1.077,
          "0.540": 1.074,
          "0.550": 1.07,
          "0.560": 1.067,
          "0.570": 1.064,
          "0.580": 1.061,
          "0.590": 1.059
        },
        {
          "Temp_Farenheit": 4,
          "0.500": 1.086,
          "0.510": 1.082,
          "0.520": 1.079,
          "0.530": 1.075,
          "0.540": 1.071,
          "0.550": 1.068,
          "0.560": 1.065,
          "0.570": 1.062,
          "0.580": 1.059,
          "0.590": 1.057
        },
        {
          "Temp_Farenheit": 6,
          "0.500": 1.084,
          "0.510": 1.08,
          "0.520": 1.076,
          "0.530": 1.072,
          "0.540": 1.069,
          "0.550": 1.065,
          "0.560": 1.062,
          "0.570": 1.059,
          "0.580": 1.057,
          "0.590": 1.054
        },
        {
          "Temp_Farenheit": 8,
          "0.500": 1.081,
          "0.510": 1.077,
          "0.520": 1.074,
          "0.530": 1.07,
          "0.540": 1.066,
          "0.550": 1.063,
          "0.560": 1.06,
          "0.570": 1.057,
          "0.580": 1.055,
          "0.590": 1.052
        },
        {
          "Temp_Farenheit": 10,
          "0.500": 1.078,
          "0.510": 1.074,
          "0.520": 1.071,
          "0.530": 1.067,
          "0.540": 1.064,
          "0.550": 1.061,
          "0.560": 1.058,
          "0.570": 1.055,
          "0.580": 1.053,
          "0.590": 1.05
        },
        {
          "Temp_Farenheit": 12,
          "0.500": 1.075,
          "0.510": 1.071,
          "0.520": 1.068,
          "0.530": 1.064,
          "0.540": 1.061,
          "0.550": 1.059,
          "0.560": 1.056,
          "0.570": 1.053,
          "0.580": 1.051,
          "0.590": 1.048
        },
        {
          "Temp_Farenheit": 14,
          "0.500": 1.072,
          "0.510": 1.069,
          "0.520": 1.066,
          "0.530": 1.062,
          "0.540": 1.059,
          "0.550": 1.056,
          "0.560": 1.053,
          "0.570": 1.051,
          "0.580": 1.049,
          "0.590": 1.046
        },
        {
          "Temp_Farenheit": 16,
          "0.500": 1.07,
          "0.510": 1.066,
          "0.520": 1.063,
          "0.530": 1.06,
          "0.540": 1.056,
          "0.550": 1.054,
          "0.560": 1.051,
          "0.570": 1.048,
          "0.580": 1.046,
          "0.590": 1.044
        },
        {
          "Temp_Farenheit": 18,
          "0.500": 1.067,
          "0.510": 1.064,
          "0.520": 1.061,
          "0.530": 1.057,
          "0.540": 1.054,
          "0.550": 1.051,
          "0.560": 1.049,
          "0.570": 1.046,
          "0.580": 1.044,
          "0.590": 1.042
        },
        {
          "Temp_Farenheit": 20,
          "0.500": 1.064,
          "0.510": 1.061,
          "0.520": 1.058,
          "0.530": 1.054,
          "0.540": 1.051,
          "0.550": 1.049,
          "0.560": 1.046,
          "0.570": 1.044,
          "0.580": 1.042,
          "0.590": 1.04
        },
        {
          "Temp_Farenheit": 22,
          "0.500": 1.061,
          "0.510": 1.058,
          "0.520": 1.055,
          "0.530": 1.052,
          "0.540": 1.049,
          "0.550": 1.046,
          "0.560": 1.044,
          "0.570": 1.042,
          "0.580": 1.04,
          "0.590": 1.038
        },
        {
          "Temp_Farenheit": 24,
          "0.500": 1.058,
          "0.510": 1.055,
          "0.520": 1.052,
          "0.530": 1.049,
          "0.540": 1.046,
          "0.550": 1.044,
          "0.560": 1.042,
          "0.570": 1.04,
          "0.580": 1.038,
          "0.590": 1.036
        },
        {
          "Temp_Farenheit": 26,
          "0.500": 1.055,
          "0.510": 1.052,
          "0.520": 1.049,
          "0.530": 1.047,
          "0.540": 1.044,
          "0.550": 1.042,
          "0.560": 1.039,
          "0.570": 1.037,
          "0.580": 1.036,
          "0.590": 1.034
        },
        {
          "Temp_Farenheit": 28,
          "0.500": 1.052,
          "0.510": 1.049,
          "0.520": 1.047,
          "0.530": 1.044,
          "0.540": 1.041,
          "0.550": 1.039,
          "0.560": 1.037,
          "0.570": 1.035,
          "0.580": 1.034,
          "0.590": 1.032
        },
        {
          "Temp_Farenheit": 30,
          "0.500": 1.049,
          "0.510": 1.046,
          "0.520": 1.044,
          "0.530": 1.041,
          "0.540": 1.039,
          "0.550": 1.037,
          "0.560": 1.035,
          "0.570": 1.033,
          "0.580": 1.032,
          "0.590": 1.03
        },
        {
          "Temp_Farenheit": 32,
          "0.500": 1.046,
          "0.510": 1.043,
          "0.520": 1.041,
          "0.530": 1.038,
          "0.540": 1.036,
          "0.550": 1.035,
          "0.560": 1.033,
          "0.570": 1.031,
          "0.580": 1.03,
          "0.590": 1.028
        },
        {
          "Temp_Farenheit": 34,
          "0.500": 1.043,
          "0.510": 1.04,
          "0.520": 1.038,
          "0.530": 1.036,
          "0.540": 1.034,
          "0.550": 1.032,
          "0.560": 1.031,
          "0.570": 1.029,
          "0.580": 1.028,
          "0.590": 1.026
        },
        {
          "Temp_Farenheit": 36,
          "0.500": 1.039,
          "0.510": 1.037,
          "0.520": 1.035,
          "0.530": 1.033,
          "0.540": 1.031,
          "0.550": 1.03,
          "0.560": 1.028,
          "0.570": 1.027,
          "0.580": 1.025,
          "0.590": 1.024
        },
        {
          "Temp_Farenheit": 38,
          "0.500": 1.036,
          "0.510": 1.034,
          "0.520": 1.032,
          "0.530": 1.031,
          "0.540": 1.029,
          "0.550": 1.027,
          "0.560": 1.026,
          "0.570": 1.025,
          "0.580": 1.023,
          "0.590": 1.022
        },
        {
          "Temp_Farenheit": 40,
          "0.500": 1.033,
          "0.510": 1.031,
          "0.520": 1.029,
          "0.530": 1.028,
          "0.540": 1.026,
          "0.550": 1.025,
          "0.560": 1.024,
          "0.570": 1.023,
          "0.580": 1.021,
          "0.590": 1.02
        },
        {
          "Temp_Farenheit": 42,
          "0.500": 1.03,
          "0.510": 1.028,
          "0.520": 1.027,
          "0.530": 1.025,
          "0.540": 1.024,
          "0.550": 1.023,
          "0.560": 1.022,
          "0.570": 1.021,
          "0.580": 1.019,
          "0.590": 1.018
        },
        {
          "Temp_Farenheit": 44,
          "0.500": 1.027,
          "0.510": 1.025,
          "0.520": 1.023,
          "0.530": 1.022,
          "0.540": 1.021,
          "0.550": 1.02,
          "0.560": 1.019,
          "0.570": 1.018,
          "0.580": 1.017,
          "0.590": 1.016
        },
        {
          "Temp_Farenheit": 46,
          "0.500": 1.023,
          "0.510": 1.022,
          "0.520": 1.021,
          "0.530": 1.02,
          "0.540": 1.018,
          "0.550": 1.018,
          "0.560": 1.017,
          "0.570": 1.016,
          "0.580": 1.015,
          "0.590": 1.014
        },
        {
          "Temp_Farenheit": 48,
          "0.500": 1.02,
          "0.510": 1.019,
          "0.520": 1.018,
          "0.530": 1.017,
          "0.540": 1.016,
          "0.550": 1.015,
          "0.560": 1.014,
          "0.570": 1.013,
          "0.580": 1.013,
          "0.590": 1.012
        },
        {
          "Temp_Farenheit": 50,
          "0.500": 1.017,
          "0.510": 1.016,
          "0.520": 1.015,
          "0.530": 1.014,
          "0.540": 1.013,
          "0.550": 1.013,
          "0.560": 1.012,
          "0.570": 1.011,
          "0.580": 1.011,
          "0.590": 1.01
        },
        {
          "Temp_Farenheit": 52,
          "0.500": 1.014,
          "0.510": 1.012,
          "0.520": 1.012,
          "0.530": 1.011,
          "0.540": 1.01,
          "0.550": 1.01,
          "0.560": 1.009,
          "0.570": 1.009,
          "0.580": 1.009,
          "0.590": 1.008
        },
        {
          "Temp_Farenheit": 54,
          "0.500": 1.01,
          "0.510": 1.009,
          "0.520": 1.009,
          "0.530": 1.008,
          "0.540": 1.008,
          "0.550": 1.007,
          "0.560": 1.007,
          "0.570": 1.007,
          "0.580": 1.006,
          "0.590": 1.006
        },
        {
          "Temp_Farenheit": 56,
          "0.500": 1.007,
          "0.510": 1.006,
          "0.520": 1.006,
          "0.530": 1.005,
          "0.540": 1.005,
          "0.550": 1.005,
          "0.560": 1.005,
          "0.570": 1.005,
          "0.580": 1.004,
          "0.590": 1.004
        },
        {
          "Temp_Farenheit": 58,
          "0.500": 1.003,
          "0.510": 1.003,
          "0.520": 1.003,
          "0.530": 1.003,
          "0.540": 1.003,
          "0.550": 1.002,
          "0.560": 1.002,
          "0.570": 1.002,
          "0.580": 1.002,
          "0.590": 1.002
        },
        {
          "Temp_Farenheit": 60,
          "0.500": 1,
          "0.510": 1,
          "0.520": 1,
          "0.530": 1,
          "0.540": 1,
          "0.550": 1,
          "0.560": 1,
          "0.570": 1,
          "0.580": 1,
          "0.590": 1
        },
        {
          "Temp_Farenheit": 62,
          "0.500": 0.997,
          "0.510": 0.997,
          "0.520": 0.997,
          "0.530": 0.997,
          "0.540": 0.997,
          "0.550": 0.997,
          "0.560": 0.998,
          "0.570": 0.998,
          "0.580": 0.998,
          "0.590": 0.998
        },
        {
          "Temp_Farenheit": 64,
          "0.500": 0.993,
          "0.510": 0.994,
          "0.520": 0.994,
          "0.530": 0.994,
          "0.540": 0.994,
          "0.550": 0.995,
          "0.560": 0.995,
          "0.570": 0.995,
          "0.580": 0.996,
          "0.590": 0.996
        },
        {
          "Temp_Farenheit": 66,
          "0.500": 0.99,
          "0.510": 0.99,
          "0.520": 0.99,
          "0.530": 0.991,
          "0.540": 0.992,
          "0.550": 0.992,
          "0.560": 0.993,
          "0.570": 0.993,
          "0.580": 0.993,
          "0.590": 0.993
        },
        {
          "Temp_Farenheit": 68,
          "0.500": 0.986,
          "0.510": 0.987,
          "0.520": 0.987,
          "0.530": 0.988,
          "0.540": 0.989,
          "0.550": 0.99,
          "0.560": 0.99,
          "0.570": 0.99,
          "0.580": 0.991,
          "0.590": 0.991
        },
        {
          "Temp_Farenheit": 70,
          "0.500": 0.983,
          "0.510": 0.984,
          "0.520": 0.984,
          "0.530": 0.985,
          "0.540": 0.986,
          "0.550": 0.987,
          "0.560": 0.988,
          "0.570": 0.988,
          "0.580": 0.989,
          "0.590": 0.989
        },
        {
          "Temp_Farenheit": 72,
          "0.500": 0.979,
          "0.510": 0.981,
          "0.520": 0.981,
          "0.530": 0.982,
          "0.540": 0.983,
          "0.550": 0.984,
          "0.560": 0.985,
          "0.570": 0.986,
          "0.580": 0.987,
          "0.590": 0.987
        },
        {
          "Temp_Farenheit": 74,
          "0.500": 0.976,
          "0.510": 0.977,
          "0.520": 0.978,
          "0.530": 0.98,
          "0.540": 0.98,
          "0.550": 0.982,
          "0.560": 0.983,
          "0.570": 0.984,
          "0.580": 0.985,
          "0.590": 0.985
        },
        {
          "Temp_Farenheit": 76,
          "0.500": 0.972,
          "0.510": 0.974,
          "0.520": 0.975,
          "0.530": 0.977,
          "0.540": 0.978,
          "0.550": 0.979,
          "0.560": 0.98,
          "0.570": 0.981,
          "0.580": 0.982,
          "0.590": 0.983
        },
        {
          "Temp_Farenheit": 78,
          "0.500": 0.969,
          "0.510": 0.97,
          "0.520": 0.972,
          "0.530": 0.974,
          "0.540": 0.975,
          "0.550": 0.977,
          "0.560": 0.978,
          "0.570": 0.979,
          "0.580": 0.98,
          "0.590": 0.981
        },
        {
          "Temp_Farenheit": 80,
          "0.500": 0.965,
          "0.510": 0.967,
          "0.520": 0.969,
          "0.530": 0.971,
          "0.540": 0.972,
          "0.550": 0.974,
          "0.560": 0.975,
          "0.570": 0.977,
          "0.580": 0.978,
          "0.590": 0.979
        },
        {
          "Temp_Farenheit": 82,
          "0.500": 0.961,
          "0.510": 0.963,
          "0.520": 0.966,
          "0.530": 0.968,
          "0.540": 0.969,
          "0.550": 0.971,
          "0.560": 0.972,
          "0.570": 0.974,
          "0.580": 0.976,
          "0.590": 0.977
        },
        {
          "Temp_Farenheit": 84,
          "0.500": 0.957,
          "0.510": 0.96,
          "0.520": 0.962,
          "0.530": 0.965,
          "0.540": 0.966,
          "0.550": 0.968,
          "0.560": 0.97,
          "0.570": 0.972,
          "0.580": 0.974,
          "0.590": 0.975
        },
        {
          "Temp_Farenheit": 86,
          "0.500": 0.954,
          "0.510": 0.956,
          "0.520": 0.959,
          "0.530": 0.961,
          "0.540": 0.964,
          "0.550": 0.966,
          "0.560": 0.967,
          "0.570": 0.969,
          "0.580": 0.971,
          "0.590": 0.972
        },
        {
          "Temp_Farenheit": 88,
          "0.500": 0.95,
          "0.510": 0.953,
          "0.520": 0.955,
          "0.530": 0.958,
          "0.540": 0.961,
          "0.550": 0.963,
          "0.560": 0.965,
          "0.570": 0.967,
          "0.580": 0.969,
          "0.590": 0.97
        },
        {
          "Temp_Farenheit": 90,
          "0.500": 0.946,
          "0.510": 0.949,
          "0.520": 0.952,
          "0.530": 0.955,
          "0.540": 0.958,
          "0.550": 0.96,
          "0.560": 0.962,
          "0.570": 0.964,
          "0.580": 0.967,
          "0.590": 0.968
        },
        {
          "Temp_Farenheit": 92,
          "0.500": 0.942,
          "0.510": 0.946,
          "0.520": 0.949,
          "0.530": 0.952,
          "0.540": 0.955,
          "0.550": 0.957,
          "0.560": 0.959,
          "0.570": 0.962,
          "0.580": 0.964,
          "0.590": 0.966
        },
        {
          "Temp_Farenheit": 94,
          "0.500": 0.938,
          "0.510": 0.942,
          "0.520": 0.946,
          "0.530": 0.949,
          "0.540": 0.952,
          "0.550": 0.954,
          "0.560": 0.957,
          "0.570": 0.959,
          "0.580": 0.962,
          "0.590": 0.964
        },
        {
          "Temp_Farenheit": 96,
          "0.500": 0.935,
          "0.510": 0.939,
          "0.520": 0.942,
          "0.530": 0.946,
          "0.540": 0.949,
          "0.550": 0.952,
          "0.560": 0.954,
          "0.570": 0.957,
          "0.580": 0.959,
          "0.590": 0.961
        },
        {
          "Temp_Farenheit": 98,
          "0.500": 0.931,
          "0.510": 0.935,
          "0.520": 0.939,
          "0.530": 0.943,
          "0.540": 0.946,
          "0.550": 0.949,
          "0.560": 0.952,
          "0.570": 0.954,
          "0.580": 0.957,
          "0.590": 0.959
        },
        {
          "Temp_Farenheit": 100,
          "0.500": 0.927,
          "0.510": 0.932,
          "0.520": 0.936,
          "0.530": 0.94,
          "0.540": 0.943,
          "0.550": 0.946,
          "0.560": 0.949,
          "0.570": 0.952,
          "0.580": 0.954,
          "0.590": 0.957
        },
        {
          "Temp_Farenheit": 105,
          "0.500": 0.917,
          "0.510": 0.923,
          "0.520": 0.927,
          "0.530": 0.931,
          "0.540": 0.935,
          "0.550": 0.939,
          "0.560": 0.943,
          "0.570": 0.946,
          "0.580": 0.949,
          "0.590": 0.951
        },
        {
          "Temp_Farenheit": 110,
          "0.500": 0.907,
          "0.510": 0.913,
          "0.520": 0.918,
          "0.530": 0.923,
          "0.540": 0.927,
          "0.550": 0.932,
          "0.560": 0.936,
          "0.570": 0.939,
          "0.580": 0.943,
          "0.590": 0.946
        },
        {
          "Temp_Farenheit": 115,
          "0.500": 0.897,
          "0.510": 0.904,
          "0.520": 0.909,
          "0.530": 0.915,
          "0.540": 0.92,
          "0.550": 0.925,
          "0.560": 0.93,
          "0.570": 0.933,
          "0.580": 0.937,
          "0.590": 0.94
        },
        {
          "Temp_Farenheit": 120,
          "0.500": 0.887,
          "0.510": 0.894,
          "0.520": 0.9,
          "0.530": 0.907,
          "0.540": 0.912,
          "0.550": 0.918,
          "0.560": 0.923,
          "0.570": 0.927,
          "0.580": 0.931,
          "0.590": 0.934
        },
        {
          "Temp_Farenheit": 125,
          "0.500": 0.876,
          "0.510": 0.884,
          "0.520": 0.89,
          "0.530": 0.808,
          "0.540": 0.903,
          "0.550": 0.909,
          "0.560": 0.916,
          "0.570": 0.92,
          "0.580": 0.925,
          "0.590": 0.928
        },
        {
          "Temp_Farenheit": 130,
          "0.500": 0.865,
          "0.510": 0.873,
          "0.520": 0.88,
          "0.530": 0.888,
          "0.540": 0.895,
          "0.550": 0.901,
          "0.560": 0.908,
          "0.570": 0.913,
          "0.580": 0.918,
          "0.590": 0.923
        },
        {
          "Temp_Farenheit": 135,
          "0.500": 0.854,
          "0.510": 0.863,
          "0.520": 0.871,
          "0.530": 0.879,
          "0.540": 0.887,
          "0.550": 0.894,
          "0.560": 0.901,
          "0.570": 0.907,
          "0.580": 0.912,
          "0.590": 0.916
        },
        {
          "Temp_Farenheit": 140,
          "0.500": 0.842,
          "0.510": 0.852,
          "0.520": 0.961,
          "0.530": 0.87,
          "0.540": 0.879,
          "0.550": 0.886,
          "0.560": 0.893,
          "0.570": 0.9,
          "0.580": 0.905,
          "0.590": 0.91
        }
      ];
}

export const gravity_correction = new GravityCorrection().items;
