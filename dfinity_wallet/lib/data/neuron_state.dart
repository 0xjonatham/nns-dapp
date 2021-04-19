import 'package:dfinity_wallet/dfinity.dart';
import 'package:hive/hive.dart';

part 'neuron_state.g.dart';

@HiveType(typeId: 111)
enum NeuronState {
@HiveField(0)
UNSPECIFIED,
@HiveField(1)
LOCKED,
@HiveField(2)
DISSOLVING,
@HiveField(3)
UNLOCKED
}

extension NeuronStateDescription on NeuronState {
  String get description {
    switch (this) {
      case NeuronState.UNSPECIFIED:
        return "Unspecified";
      case NeuronState.DISSOLVING:
        return "Dissolving";
      case NeuronState.LOCKED:
        return "Locked";
      case NeuronState.UNLOCKED:
        return "Locked";
    }
  }

  String get iconName {
    switch (this) {
      case NeuronState.UNSPECIFIED:
        return "";
      case NeuronState.DISSOLVING:
        return "assets/history_toggle_off.svg";
      case NeuronState.LOCKED:
        return "assets/lock_clock.svg";
      case NeuronState.UNLOCKED:
        return "assets/lock_open.svg";
    }
  }

  Color get statusColor {
    switch (this) {
      case NeuronState.UNSPECIFIED:
        return AppColors.white;
      case NeuronState.DISSOLVING:
        return AppColors.yellow500;
      case NeuronState.LOCKED:
        return AppColors.white;
      case NeuronState.UNLOCKED:
        return AppColors.gray200;
    }
  }
}
